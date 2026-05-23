import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { checkRateLimit, getResponseHeaders } from "../_shared/security.ts"

const corsHeaders = getResponseHeaders();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    // Rate Limiting
    const rateLimit = await checkRateLimit(supabaseClient, {
      key: `api:sharing:${user.id}`,
      limit: 50,
      windowSeconds: 60
    });

    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        headers: corsHeaders,
        status: 429,
      })
    }

    const { action, params } = await req.json()

    let responseData: any = null

    switch (action) {
      case 'createItem': {
        const { title, description, hourly_rate_surreias, is_public } = params
        const { data, error } = await supabaseClient
          .from('equipment_items')
          .insert({
            owner_id: user.id,
            title,
            description,
            hourly_rate_surreias,
            is_public: is_public ?? true,
          })
          .select()
          .single()
        
        if (error) throw error
        responseData = data
        break
      }

      case 'updateItem': {
        const { itemId, updates } = params
        const { data, error } = await supabaseClient
          .from('equipment_items')
          .update(updates)
          .eq('id', itemId)
          .eq('owner_id', user.id)
          .select()
          .single()
        
        if (error) throw error
        responseData = data
        break
      }

      case 'askQuestion': {
        const { itemId, question_text } = params
        const { data, error } = await supabaseClient
          .from('equipment_questions')
          .insert({
            item_id: itemId,
            asker_id: user.id,
            question_text
          })
          .select()
          .single()
        
        if (error) throw error

        // Notify Owner
        try {
          const { data: item } = await supabaseAdmin
            .from('equipment_items')
            .select('owner_id, title')
            .eq('id', itemId)
            .single()
          
          if (item) {
            await supabaseAdmin.rpc('create_notification', {
              p_user_id: item.owner_id,
              p_title: { pt: 'Nova pergunta sobre seu equipamento', en: 'New question about your equipment' },
              p_message: { pt: `Uma pergunta foi feita sobre o item: ${item.title}`, en: `A question was asked about: ${item.title}` },
              p_type: 'social',
              p_link: `/sharing/${itemId}`
            })
          }
        } catch (notifErr) {
          console.error('Failed to send askQuestion notification:', notifErr)
        }

        responseData = data
        break
      }

      case 'answerQuestion': {
        const { questionId, answer_text } = params
        const { data, error } = await supabaseClient
          .from('equipment_questions')
          .update({
            answer_text,
            answered_at: new Date().toISOString()
          })
          .eq('id', questionId)
          .select()
          .single()
        
        if (error) throw error

        // Notify Asker
        try {
          const { data: q } = await supabaseAdmin
            .from('equipment_questions')
            .select('asker_id, item_id, equipment_items(title)')
            .eq('id', questionId)
            .single()
          
          if (q) {
            await supabaseAdmin.rpc('create_notification', {
              p_user_id: q.asker_id,
              p_title: { pt: 'Sua pergunta foi respondida', en: 'Your question was answered' },
              p_message: { pt: `O proprietário respondeu à sua pergunta sobre: ${q.equipment_items.title}`, en: `The owner answered your question about: ${q.equipment_items.title}` },
              p_type: 'social',
              p_link: `/sharing/${q.item_id}`
            })
          }
        } catch (notifErr) {
          console.error('Failed to send answerQuestion notification:', notifErr)
        }

        responseData = data
        break
      }

      case 'moderateItem': {
        const { itemId, justification } = params
        // Check admin role
        const { data: profile } = await supabaseClient.from('profiles').select('roles').eq('id', user.id).single()
        if (!profile?.roles?.includes('admin')) throw new Error('Forbidden')

        const { error: logError } = await supabaseAdmin
          .from('equipment_moderation_logs')
          .insert({
            item_id: itemId,
            admin_id: user.id,
            action: 'remove',
            justification
          })

        if (logError) throw logError

        const { data, error } = await supabaseAdmin
          .from('equipment_items')
          .update({ status: 'removed', is_public: false })
          .eq('id', itemId)
          .select()
          .single()

        if (error) throw error

        // Notify Owner
        try {
          await supabaseAdmin.rpc('create_notification', {
            p_user_id: data.owner_id,
            p_title: { pt: 'Seu equipamento foi removido', en: 'Your equipment was removed' },
            p_message: { pt: `O item "${data.title}" foi removido por moderação. Motivo: ${justification}`, en: `The item "${data.title}" was removed by moderation. Reason: ${justification}` },
            p_type: 'system',
            p_link: `/sharing/${itemId}`
          })
        } catch (notifErr) {
          console.error('Failed to send moderation notification:', notifErr)
        }

        responseData = data
        break
      }

      case 'startHandover': {
        const { itemId } = params
        const { data, error } = await supabaseClient
          .from('sharing_transactions')
          .insert({
            item_id: itemId,
            borrower_id: user.id,
            status: 'pending',
            started_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (error) throw error

        // Notify Owner
        try {
          const { data: item } = await supabaseAdmin
            .from('equipment_items')
            .select('owner_id, title')
            .eq('id', itemId)
            .single()
          
          if (item) {
            await supabaseAdmin.rpc('create_notification', {
              p_user_id: item.owner_id,
              p_title: { pt: 'Nova solicitação de aluguel', en: 'New rental request' },
              p_message: { pt: `O membro iniciou uma solicitação de aluguel para o item: ${item.title}`, en: `A member started a rental request for: ${item.title}` },
              p_type: 'task',
              p_link: `/sharing/${itemId}`
            })
          }
        } catch (notifErr) {
          console.error('Failed to send startHandover notification:', notifErr)
        }

        responseData = data
        break
      }

      case 'registerEvidence': {
        const { transactionId, evidence_url } = params
        const { data, error } = await supabaseClient
          .from('sharing_transactions')
          .update({
            status: 'delivered',
            delivery_evidence_url: evidence_url,
            started_at: new Date().toISOString()
          })
          .eq('id', transactionId)
          .eq('borrower_id', user.id)
          .select()
          .single()
        
        if (error) throw error

        // Notify Owner
        try {
          const { data: item } = await supabaseAdmin
            .from('equipment_items')
            .select('owner_id, title')
            .eq('id', data.item_id)
            .single()
          
          if (item) {
            await supabaseAdmin.rpc('create_notification', {
              p_user_id: item.owner_id,
              p_title: { pt: 'Evidência de entrega registrada', en: 'Delivery evidence registered' },
              p_message: { pt: `O locatário registrou a evidência de entrega para o item: ${item.title}`, en: `The borrower registered delivery evidence for: ${item.title}` },
              p_type: 'task',
              p_link: `/sharing/${data.item_id}`
            })
          }
        } catch (notifErr) {
          console.error('Failed to send registerEvidence notification:', notifErr)
        }

        responseData = data
        break
      }

      case 'confirmReturn': {
        const { transactionId } = params
        
        const { data: transaction, error: txError } = await supabaseClient
          .from('sharing_transactions')
          .select('*, equipment_items!inner(*)')
          .eq('id', transactionId)
          .single()
          
        if (txError) throw txError
        if (transaction.equipment_items.owner_id !== user.id) throw new Error('Forbidden')
        
        const started = new Date(transaction.started_at).getTime()
        const completed = new Date().getTime()
        const hours = Math.ceil((completed - started) / (1000 * 60 * 60))
        const total_surreias = hours * transaction.equipment_items.hourly_rate_surreias

        const { data, error } = await supabaseClient
          .from('sharing_transactions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            total_surreias
          })
          .eq('id', transactionId)
          .select()
          .single()
        
        if (error) throw error
        
        // Transfer surreias using wallet API
        const { error: transferError } = await supabaseAdmin.rpc('transfer_surreias', {
          sender_id: transaction.borrower_id,
          receiver_id: transaction.equipment_items.owner_id,
          amount: total_surreias,
          reference_type: 'sharing_handover',
          reference_id: transactionId,
          description: `Equipment rental: ${transaction.equipment_items.title} (${hours} hours)`
        })

        if (transferError) throw transferError

        // Notify Borrower
        try {
          await supabaseAdmin.rpc('create_notification', {
            p_user_id: transaction.borrower_id,
            p_title: { pt: 'Aluguel concluído e pago', en: 'Rental completed and paid' },
            p_message: { pt: `O proprietário confirmou a devolução de: ${transaction.equipment_items.title}. Pagamento de ${total_surreias} $S processado.`, en: `The owner confirmed return of: ${transaction.equipment_items.title}. Payment of ${total_surreias} $S processed.` },
            p_type: 'finance',
            p_link: `/sharing/${transaction.item_id}`
          })
        } catch (notifErr) {
          console.error('Failed to send confirmReturn notification:', notifErr)
        }

        responseData = data
        break
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify({ data: responseData, error: null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ data: null, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
