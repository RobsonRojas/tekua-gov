import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { canCancelCircle, canCloseCircle, validateNewCircle } from "./circleRules.ts"
import { canWriteProtocols, isProtocolStatus, validateProtocolInput } from "./protocolRules.ts"
import { acceptsVotes, notificationTargets, parseRewardAmount, resolveReplyParent, sanitizeMentionIds, TOPIC_STATUS_OPEN } from "./topicRules.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    const { action, params } = await req.json()

    const isAdminUser = async (userId: string) => {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role, roles')
        .eq('id', userId)
        .single()
      return profile?.role === 'admin' || !!profile?.roles?.includes('admin')
    }

    // Escrita de protocolos: administrador ou membro do Conselho Transversal.
    const canWriteProtocolsUser = async (userId: string) => {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role, roles')
        .eq('id', userId)
        .single()
      return canWriteProtocols(profile?.role, profile?.roles)
    }

    let responseData: any = null

    // Helper: paga a recompensa da pauta (no máximo 1 por pauta/membro/tipo). Nunca falha a interação.
    const grantReward = async (topicId: string, kind: 'vote' | 'comment'): Promise<number> => {
      try {
        const { data, error } = await supabaseAdmin.rpc('grant_topic_reward', {
          p_topic_id: topicId, p_user_id: user.id, p_kind: kind
        })
        if (error) throw error
        return Number(data) || 0
      } catch (err) {
        console.error(`Failed to grant ${kind} reward for topic ${topicId}:`, err)
        return 0
      }
    }

    switch (action) {
      case 'fetchSettings': {
        const { data, error } = await supabaseClient
          .from('governance_settings')
          .select('*')
          .eq('id', 'current')
          .single()
        
        if (error && error.code !== 'PGRST116') throw error
        
        // Return defaults if missing
        responseData = data || {
          id: 'current',
          voting_duration_days: 7,
          quorum_percentage: 50,
          min_contribution_confirmations: 3,
          min_reward_amount: 1.00,
          max_reward_amount: 1000.00,
          auto_approve_small_tasks: false,
          default_ai_model: 'gemini-1.5-flash',
          task_reminder_frequencies: {
            urgent_important: '1 hour',
            urgent_not_important: '1 day',
            not_urgent_important: '1 day',
            not_urgent_not_important: '1 week'
          }
        }
        break
      }

      case 'fetchTopics': {
        const { status = 'all' } = params
        let query = supabaseClient
          .from('discussion_topics')
          .select('*')
        
        if (status !== 'all') {
          query = query.eq('status', status)
        }

        const { data, error } = await query.order('created_at', { ascending: false })
        if (error) throw error
        responseData = data
        break
      }

      case 'castVote': {
        const { topicId, option } = params
        if (!topicId || !option) throw new Error('Missing topicId or option')

        // 1. Verify topic exists and is active
        const { data: topic, error: topicError } = await supabaseClient
          .from('discussion_topics')
          .select('status')
          .eq('id', topicId)
          .single()
        
        if (topicError || !topic) throw new Error('Topic not found')
        if (!acceptsVotes(topic.status)) throw new Error('This topic is no longer accepting votes')

        // 2. Cast vote (upsert)
        const { data: vote, error: voteError } = await supabaseClient
          .from('topic_votes')
          .upsert({ 
            topic_id: topicId, 
            user_id: user.id, 
            option,
            updated_at: new Date().toISOString()
          })
          .select()

        if (voteError) throw voteError

        const rewardAmountGranted = await grantReward(topicId, 'vote')
        responseData = { vote, reward: rewardAmountGranted > 0 ? { amount: rewardAmountGranted } : null }
        break
      }

      case 'removeVote': {
        const { topicId } = params
        if (!topicId) throw new Error('Missing topicId')

        // 1. Verify topic exists and is active
        const { data: topic, error: topicError } = await supabaseClient
          .from('discussion_topics')
          .select('status')
          .eq('id', topicId)
          .single()

        if (topicError || !topic) throw new Error('Topic not found')
        if (!acceptsVotes(topic.status)) throw new Error('This topic is no longer accepting votes')

        // 2. Remove vote
        const { error: deleteError } = await supabaseClient
          .from('topic_votes')
          .delete()
          .eq('topic_id', topicId)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError

        responseData = { removed: true }
        break
      }

      case 'saveConfig': {
        // Admin only check
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role, roles')
          .eq('id', user.id)
          .single()
        
        const isAdmin = profile?.role === 'admin' || profile?.roles?.includes('admin')
        if (!isAdmin) throw new Error('Forbidden')

        const { config } = params
        const { data, error } = await supabaseAdmin
          .from('governance_settings')
          .upsert({ 
            id: 'current', // Assuming singleton config
            ...config,
            updated_at: new Date().toISOString()
          })
          .select()

        if (error) throw error
        responseData = data
        break
      }

      case 'createTopic': {
        // Admin only check
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role, roles')
          .eq('id', user.id)
          .single()
        
        const isAdmin = profile?.role === 'admin' || profile?.roles?.includes('admin')
        if (!isAdmin) throw new Error('Forbidden')

        const { title, content, rewardAmount } = params
        const reward = parseRewardAmount(rewardAmount)
        if (!reward.ok) throw new Error(reward.error)
        const { data, error } = await supabaseAdmin
          .from('discussion_topics')
          .insert([{ 
            title, 
            content, 
            reward_amount: reward.amount,
            status: TOPIC_STATUS_OPEN,
            created_at: new Date().toISOString()
          }])
          .select()

        if (error) throw error
        responseData = data

        // Dispara o email de notificação assincronamente
        if (data && data[0]) {
          const topic = data[0]
          fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/notify-engine`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
            },
            body: JSON.stringify({
              event: 'governance.agenda_created',
              payload: {
                topic_id: topic.id,
                title: topic.title
              }
            })
          }).catch(err => console.error('Failed to notify agenda creation:', err))
        }

        break
      }

      case 'updateTopic': {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role, roles')
          .eq('id', user.id)
          .single()
        const isAdmin = profile?.role === 'admin' || profile?.roles?.includes('admin')
        if (!isAdmin) throw new Error('Forbidden')

        const { id, title, content, rewardAmount } = params
        if (!id) throw new Error('Missing topic ID')
        const reward = parseRewardAmount(rewardAmount)
        if (!reward.ok) throw new Error(reward.error)
        if (!title || !content) throw new Error('Missing title or content')

        const { data, error } = await supabaseAdmin
          .from('discussion_topics')
          .update({ title, content, reward_amount: reward.amount, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
        if (error) throw error
        if (!data || data.length === 0) throw new Error('Topic not found')
        responseData = data
        break
      }

      case 'fetchTopicDetail': {
        const { id } = params
        if (!id) throw new Error('Missing topic ID')

        // 1. Fetch Topic
        const { data: topic, error: topicError } = await supabaseClient
          .from('discussion_topics')
          .select('*')
          .eq('id', id)
          .single()
        
        if (topicError) throw topicError

        // 2. Fetch Comments (topic_comments.user_id referencia auth.users, não profiles:
        // os perfis são buscados à parte, pois o embed do PostgREST não tem relação para usar)
        const { data: rawComments, error: commentsError } = await supabaseClient
          .from('topic_comments')
          .select('*')
          .eq('topic_id', id)
          .order('created_at', { ascending: true })

        if (commentsError) throw commentsError

        const authorIds = [...new Set((rawComments || []).map((c: { user_id: string }) => c.user_id))]
        const authors: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
        if (authorIds.length > 0) {
          const { data: ap } = await supabaseAdmin.from('profiles').select('id, full_name, avatar_url').in('id', authorIds)
          for (const p of ap || []) authors[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url }
        }
        const comments = (rawComments || []).map((c: { user_id: string; mentioned_user_ids?: string[] }) => ({
          ...c,
          profiles: authors[c.user_id] || { full_name: null, avatar_url: null }
        }))

        // 3. Fetch Votes Stats
        const { data: votes, error: votesError } = await supabaseClient
          .from('topic_votes')
          .select('option, user_id')
          .eq('topic_id', id)
        
        if (votesError) throw votesError

        const stats = { yes: 0, no: 0, abstain: 0 }
        let userVoted = false
        let userVoteOption: string | null = null
        votes.forEach(v => {
          if (v.option === 'yes') stats.yes++
          if (v.option === 'no') stats.no++
          if (v.option === 'abstain') stats.abstain++
          if (v.user_id === user.id) {
            userVoted = true
            userVoteOption = v.option
          }
        })

        // Nomes dos membros mencionados (para destacar nos comentários)
        const mentionedIds = [...new Set((comments || []).flatMap((c: { mentioned_user_ids?: string[] }) => c.mentioned_user_ids || []))]
        let mentionedProfiles: Record<string, string> = {}
        if (mentionedIds.length > 0) {
          const { data: mp } = await supabaseAdmin.from('profiles').select('id, full_name').in('id', mentionedIds)
          mentionedProfiles = Object.fromEntries((mp || []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name || '']))
        }

        responseData = { topic, comments, stats, userVoted, userVoteOption, mentionedProfiles }
        break
      }

      case 'addComment': {
        const { topicId, content, parentId, mentionedUserIds } = params
        if (!topicId || !content) throw new Error('Missing topicId or content')

        // Pauta precisa existir e estar aberta
        const { data: topic, error: topicError } = await supabaseClient
          .from('discussion_topics')
          .select('id, title, status')
          .eq('id', topicId)
          .single()
        if (topicError || !topic) throw new Error('Topic not found')
        if (!acceptsVotes(topic.status)) throw new Error('This topic is closed for comments')

        // Resposta: pai da mesma pauta, normalizado para o comentário raiz
        let resolvedParentId: string | null = null
        let parentAuthorId: string | null = null
        if (parentId) {
          const { data: parent } = await supabaseClient
            .from('topic_comments')
            .select('id, topic_id, parent_id, user_id')
            .eq('id', parentId)
            .maybeSingle()
          const resolved = resolveReplyParent(parent, topicId)
          if (!resolved.ok) throw new Error(resolved.error)
          resolvedParentId = resolved.parentId
          parentAuthorId = parent!.user_id
        }

        // Menções: apenas membros existentes
        const requested = sanitizeMentionIds(mentionedUserIds, user.id)
        let validMentions: string[] = []
        if (requested.length > 0) {
          const { data: found } = await supabaseAdmin.from('profiles').select('id').in('id', requested)
          const foundIds = new Set((found || []).map((p: { id: string }) => p.id))
          validMentions = requested.filter((id) => foundIds.has(id))
        }

        const { data, error } = await supabaseClient
          .from('topic_comments')
          .insert([{
            topic_id: topicId,
            user_id: user.id,
            content,
            parent_id: resolvedParentId,
            mentioned_user_ids: validMentions
          }])
          .select()

        if (error) throw error

        const commentReward = await grantReward(topicId, 'comment')
        responseData = { comments: data, reward: commentReward > 0 ? { amount: commentReward } : null }

        // Notificações assíncronas (não bloqueiam a resposta)
        const targets = notificationTargets(user.id, validMentions, parentAuthorId)
        const text = typeof content === 'string' ? content : (content?.pt || content?.en || '')
        const send = (event: string, recipients: string[]) => {
          if (recipients.length === 0) return
          fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/notify-engine`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              event,
              payload: { topic_id: topicId, title: topic.title, content: text, recipientIds: recipients }
            })
          }).catch(err => console.error(`Failed to notify ${event}:`, err))
        }
        send('governance.topic_mention', targets.mention)
        send('governance.topic_reply', targets.reply)
        break
      }

      case 'createRestorativeCircle': {
        const { title, description, scheduledAt, locationOrLink, confirmedPreCircles } = params
        const checked = validateNewCircle({ title, description, scheduledAt, confirmedPreCircles }, Date.now())
        if (!checked.ok) throw new Error(checked.error)
        const cleanTitle = checked.title

        const { data, error } = await supabaseClient
          .from('restorative_circles')
          .insert([{
            title: cleanTitle,
            description: typeof description === 'string' && description.trim() ? description.trim() : null,
            scheduled_at: checked.scheduledAt,
            location_or_link: typeof locationOrLink === 'string' && locationOrLink.trim() ? locationOrLink.trim() : null,
            confirmed_pre_circles: true,
            created_by: user.id,
          }])
          .select()
          .single()

        if (error) {
          if (error.code === '23505') throw new Error('You already have an open restorative circle')
          throw error
        }
        responseData = data

        // Convite à vila por email, notificação in-app e push (não bloqueia a resposta)
        fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/notify-engine`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            event: 'restorative_circle.convened',
            payload: {
              circle_id: data.id,
              title: data.title,
              scheduled_at: data.scheduled_at,
              share_token: data.share_token
            }
          })
        }).catch(err => console.error('Failed to notify restorative circle:', err))
        break
      }

      case 'fetchOpenRestorativeCircles': {
        const { data, error } = await supabaseClient
          .from('restorative_circles')
          .select('id, title, scheduled_at, share_token')
          .eq('status', 'open')
          .gt('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(5)

        if (error) throw error
        responseData = data
        break
      }

      case 'fetchRestorativeCircleByToken': {
        const { token } = params
        if (!token || typeof token !== 'string') throw new Error('Missing token')

        const { data, error } = await supabaseClient
          .from('restorative_circles')
          .select('id, title, description, scheduled_at, location_or_link, status, share_token, created_at, created_by')
          .eq('share_token', token)
          .maybeSingle()

        if (error) throw error
        if (!data) throw new Error('Restorative circle not found')
        // Não expõe o id do autor: informa apenas se quem consulta é o autor.
        const { created_by, ...circle } = data
        responseData = { ...circle, is_author: created_by === user.id }
        break
      }

      case 'closeRestorativeCircle': {
        const { id } = params
        if (!id) throw new Error('Missing circle ID')

        const { data: circle, error: fetchError } = await supabaseAdmin
          .from('restorative_circles')
          .select('id, created_by, status')
          .eq('id', id)
          .maybeSingle()

        if (fetchError) throw fetchError
        if (!circle) throw new Error('Restorative circle not found')
        if (circle.status !== 'open') throw new Error('Restorative circle is not open')

        if (!canCloseCircle(circle, user.id, await isAdminUser(user.id))) throw new Error('Forbidden')

        const { error } = await supabaseAdmin
          .from('restorative_circles')
          .update({ status: 'closed' })
          .eq('id', id)

        if (error) throw error
        responseData = { id, status: 'closed' }
        break
      }

      case 'cancelRestorativeCircle': {
        const { id } = params
        if (!id) throw new Error('Missing circle ID')
        if (!canCancelCircle(await isAdminUser(user.id))) throw new Error('Forbidden')

        const { data, error } = await supabaseAdmin
          .from('restorative_circles')
          .update({ status: 'cancelled', cancelled_by: user.id })
          .eq('id', id)
          .eq('status', 'open')
          .select('id, status, cancelled_by')
          .maybeSingle()

        if (error) throw error
        if (!data) throw new Error('Restorative circle is not open')
        responseData = data
        break
      }

      case 'fetchAllRestorativeCircles': {
        if (!(await isAdminUser(user.id))) throw new Error('Forbidden')

        const { data: circles, error } = await supabaseAdmin
          .from('restorative_circles')
          .select('id, title, status, scheduled_at, created_at, created_by, cancelled_by, share_token')
          .order('created_at', { ascending: false })

        if (error) throw error

        const authorIds = [...new Set((circles || []).map((c: any) => c.created_by))]
        const { data: authors } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name')
          .in('id', authorIds)
        const names = new Map((authors || []).map((a: any) => [a.id, a.full_name]))

        responseData = (circles || []).map((c: any) => ({ ...c, author_name: names.get(c.created_by) ?? null }))
        break
      }

      case 'fetchRestorativeCircleById': {
        if (!(await isAdminUser(user.id))) throw new Error('Forbidden')
        const { id } = params
        if (!id || typeof id !== 'string') throw new Error('Missing circle ID')

        const { data: circle, error } = await supabaseAdmin
          .from('restorative_circles')
          .select('id, title, description, scheduled_at, location_or_link, status, created_at, confirmed_pre_circles, share_token, created_by')
          .eq('id', id)
          .maybeSingle()

        if (error) {
          // id fora do formato uuid: tratado como não encontrado
          if (error.code === '22P02') throw new Error('Restorative circle not found')
          throw error
        }
        if (!circle) throw new Error('Restorative circle not found')

        const { data: author } = await supabaseAdmin
          .from('profiles')
          .select('full_name')
          .eq('id', circle.created_by)
          .maybeSingle()

        const { created_by: _createdBy, ...fields } = circle
        responseData = { ...fields, author_name: author?.full_name ?? null }
        break
      }

      case 'listProtocols': {
        const writer = await canWriteProtocolsUser(user.id)
        let query = supabaseAdmin
          .from('governance_protocols')
          .select('id, title, status, updated_at')
          .order('title', { ascending: true })
        // Arquivados só para quem escreve e pede explicitamente.
        if (!(writer && params?.includeArchived === true)) query = query.eq('status', 'active')
        const { data, error } = await query
        if (error) throw error
        responseData = { protocols: data || [], canWrite: writer }
        break
      }

      case 'fetchProtocol': {
        const { id } = params || {}
        if (!id || typeof id !== 'string') throw new Error('Missing protocol ID')
        // Protocolos arquivados continuam legíveis: atividades antigas ainda os usam.
        const { data, error } = await supabaseAdmin
          .from('governance_protocols')
          .select('id, title, content, status, updated_at')
          .eq('id', id)
          .maybeSingle()
        if (error) {
          if (error.code === '22P02') throw new Error('Protocol not found')
          throw error
        }
        if (!data) throw new Error('Protocol not found')
        responseData = data
        break
      }

      case 'createProtocol': {
        if (!(await canWriteProtocolsUser(user.id))) throw new Error('Forbidden')
        const checked = validateProtocolInput(params || {})
        if (!checked.ok) throw new Error(checked.error)
        const { data, error } = await supabaseAdmin
          .from('governance_protocols')
          .insert({ title: checked.title, content: checked.content, created_by: user.id })
          .select('id, title, content, status, updated_at')
          .single()
        if (error) throw error
        responseData = data
        break
      }

      case 'updateProtocol': {
        if (!(await canWriteProtocolsUser(user.id))) throw new Error('Forbidden')
        const { id } = params || {}
        if (!id || typeof id !== 'string') throw new Error('Missing protocol ID')
        const checked = validateProtocolInput(params || {})
        if (!checked.ok) throw new Error(checked.error)
        const { data, error } = await supabaseAdmin
          .from('governance_protocols')
          .update({ title: checked.title, content: checked.content, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select('id, title, content, status, updated_at')
          .maybeSingle()
        if (error) {
          if (error.code === '22P02') throw new Error('Protocol not found')
          throw error
        }
        if (!data) throw new Error('Protocol not found')
        responseData = data
        break
      }

      case 'setProtocolStatus': {
        if (!(await canWriteProtocolsUser(user.id))) throw new Error('Forbidden')
        const { id, status } = params || {}
        if (!id || typeof id !== 'string') throw new Error('Missing protocol ID')
        if (!isProtocolStatus(status)) throw new Error('Invalid protocol status')
        const { data, error } = await supabaseAdmin
          .from('governance_protocols')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select('id, status')
          .maybeSingle()
        if (error) {
          if (error.code === '22P02') throw new Error('Protocol not found')
          throw error
        }
        if (!data) throw new Error('Protocol not found')
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
