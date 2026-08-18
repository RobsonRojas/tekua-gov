import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import webpush from 'https://esm.sh/web-push'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { event, payload } = await req.json()
    console.log(`Processing event: ${event}`, payload)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(
        'mailto:contato@tekua.org',
        vapidPublicKey,
        vapidPrivateKey
      )
    }

    // 1. Identify Recipients and Template
    let recipients: string[] = []
    let template = { 
      subject: '', 
      body: '', 
      pushTitle: '', 
      pushBody: '', 
      link: '' 
    }

    const title = typeof payload.title === 'string' ? payload.title : (payload.title?.pt || payload.title?.en || 'Tarefa')

    if (event === 'activity.created') {
      if (payload.executor_ids && payload.executor_ids.length > 0) {
        recipients = payload.executor_ids
      } else {
        const { data: members } = await supabaseClient.from('profiles').select('id')
        recipients = members?.map(m => m.id) || []
      }
      template = {
        subject: `Nova Demanda: ${title}`,
        body: `Uma nova oportunidade de trabalho foi publicada: "${title}". Acesse o portal para assumir esta tarefa.`,
        pushTitle: 'Nova Oportunidade',
        pushBody: title,
        link: '/work'
      }
    } else if (event === 'activity.claimed') {
      recipients = [payload.requester_id]
      template = {
        subject: `Sua demanda foi assumida: ${title}`,
        body: `A demanda "${title}" foi assumida por um membro e já está em execução.`,
        pushTitle: 'Tarefa em Execução',
        pushBody: title,
        link: '/work'
      }
    } else if (event === 'activity.submitted') {
      recipients = [payload.requester_id]
      template = {
        subject: `Trabalho pronto para validação: ${title}`,
        body: `O executor finalizou a tarefa "${title}" e submeteu as evidências para sua validação.`,
        pushTitle: 'Aguardando Validação',
        pushBody: title,
        link: '/work'
      }
    } else if (event === 'activity.completed') {
      recipients = payload.executor_ids && payload.executor_ids.length > 0 ? payload.executor_ids : (payload.worker_id ? [payload.worker_id] : [])
      template = {
        subject: `Trabalho Validado: ${title}`,
        body: `Seu trabalho na tarefa "${title}" foi validado e o pagamento foi processado.`,
        pushTitle: 'Trabalho Validado',
        pushBody: title,
        link: '/wallet'
      }
    } else if (event === 'activity.interaction_mention') {
      recipients = payload.mentionedUserIds || []
      const interactionContent = payload.content || ''
      const shortContent = interactionContent.length > 100 ? interactionContent.substring(0, 100) + '...' : interactionContent
      template = {
        subject: `Você foi mencionado em uma tarefa: ${title}`,
        body: `Você foi mencionado no comentário da tarefa "${title}": "${shortContent}".`,
        pushTitle: 'Você foi mencionado',
        pushBody: `Em: ${title}`,
        link: `/tasks/${payload.activity_id}`
      }
    } else if (event === 'governance.agenda_created') {
      // Notificamos todos os usuários ativos ou membros
      const { data: members } = await supabaseClient.from('profiles').select('id')
      recipients = members?.map(m => m.id) || []
      template = {
        subject: `Nova Pauta para Votação: ${title}`,
        body: `Uma nova pauta de governança foi criada e está disponível para discussão e votação: "${title}". Acesse o portal para participar.`,
        pushTitle: 'Nova Pauta de Governança',
        pushBody: title,
        link: `/voting/${payload.topic_id}`
      }
    } else if (event === 'notification.surreal_receipt') {
      // Surreal receipt broadcast - notifications are already created by the DB trigger
      // This handler only sends push and email notifications
      const notifData = payload.data || {}
      const recipientName = notifData.recipientName || 'Membro'
      const senderName = notifData.senderName || 'Membro'
      const amount = notifData.amount || 0
      const transactionId = notifData.transactionId || ''
      const description = notifData.description || ''

      // Get all members except sender and recipient for broadcast
      const { data: members } = await supabaseClient.from('profiles').select('id')
      const excludeIds = [payload.from_id, payload.to_id].filter(Boolean)
      recipients = members?.filter(m => !excludeIds.includes(m.id)).map(m => m.id) || []

      template = {
        subject: `🌟 ${recipientName} recebeu ${amount} $S na comunidade!`,
        body: `${recipientName} recebeu ${amount} Surreais ($S) de ${senderName}${description ? ': "' + description + '"' : ''}. Que tal ganhar seus próprios surreais? Acesse o work-wall e descubra oportunidades.`,
        pushTitle: `🌟 Surreais Ganhos!`,
        pushBody: `${recipientName} recebeu ${amount} $S de ${senderName}`,
        link: `/share/surreal/${transactionId}`
      }
    }

    // 2. Deliver Notifications
    const notificationPromises = recipients.map(async (userId) => {
      // a. Save In-App Notification (skip for surreal_receipt - already created by DB trigger)
      if (event !== 'notification.surreal_receipt') {
        await supabaseClient.from('notifications').insert({
          user_id: userId,
          title: template.pushTitle,
          content: template.pushBody,
          type: 'task',
          link: template.link
        })
      }

      // b. Send Web Push
      const { data: subs } = await supabaseClient
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)

      if (subs && subs.length > 0 && vapidPublicKey) {
        for (const sub of subs) {
          try {
            await webpush.sendNotification({
              endpoint: sub.endpoint,
              keys: { auth: sub.auth_key, p256dh: sub.p256dh_key }
            }, JSON.stringify({
              title: template.pushTitle,
              body: template.pushBody,
              url: template.link
            }))
          } catch (e) {
            console.error(`Push delivery failed for user ${userId}:`, e)
            if (e.statusCode === 410 || e.statusCode === 404) {
              // Clean up expired subscriptions
              await supabaseClient.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
            }
          }
        }
      }

      // c. Send Email via Resend
      if (resendApiKey) {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single()

        if (profile?.email) {
          try {
            // Build email HTML based on event type
            let emailHtml = ''
            if (event === 'notification.surreal_receipt') {
              const notifData = payload.data || {}
              const baseUrl = 'https://tekua-gov.vercel.app'
              emailHtml = `
                <div style="font-family: 'Inter', 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
                  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 8px;">🌟</div>
                    <h1 style="color: #1a1a2e; margin: 0; font-size: 22px; font-weight: 800;">Surreais Ganhos na Comunidade!</h1>
                  </div>
                  <div style="padding: 32px; color: #e2e8f0;">
                    <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                      <p style="font-size: 14px; margin: 0 0 8px 0; color: #94a3b8;">${notifData.recipientName || 'Membro'} recebeu</p>
                      <p style="font-size: 36px; font-weight: 800; margin: 0; color: #f59e0b;">${notifData.amount || 0} $S</p>
                      <p style="font-size: 14px; margin: 8px 0 0 0; color: #94a3b8;">de ${notifData.senderName || 'Membro'}</p>
                    </div>
                    ${notifData.description ? `<p style="font-size: 14px; color: #94a3b8; text-align: center; font-style: italic; margin-bottom: 24px;">"${notifData.description}"</p>` : ''}
                    <div style="text-align: center; margin-bottom: 16px;">
                      <a href="${baseUrl}/share/surreal/${notifData.transactionId || ''}"
                         style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #1a1a2e; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">
                        Ver Recibo
                      </a>
                    </div>
                    <div style="text-align: center;">
                      <a href="${baseUrl}/work-wall"
                         style="display: inline-block; background: transparent; color: #f59e0b; padding: 12px 24px; text-decoration: none; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.4); font-weight: 600; font-size: 14px;">
                        🚀 Ganhe seus Surreais no Work-Wall
                      </a>
                    </div>
                  </div>
                  <div style="padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.05);">
                    <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">Este é um email automático da Tekuá. Não responda a esta mensagem.</p>
                  </div>
                </div>
              `
            } else {
              emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #6366f1;">Notificação de Governança</h2>
                  <p>${template.body}</p>
                  <div style="margin-top: 30px;">
                    <a href="https://tekua-gov.vercel.app${template.link}" 
                       style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Ver no Portal
                    </a>
                  </div>
                  <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;" />
                  <p style="font-size: 12px; color: #666;">Este é um email automático da Tekuá. Não responda a esta mensagem.</p>
                </div>
              `
            }

            const emailRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
              },
              body: JSON.stringify({
                from: 'Tekuá Governança <alertas@tekua.org>',
                to: profile.email,
                subject: template.subject,
                html: emailHtml
              })
            })
            if (!emailRes.ok) {
              const errorText = await emailRes.text()
              console.error(`Email delivery failed for user ${userId}:`, errorText)
            }
          } catch (e) {
            console.error(`Resend API error for user ${userId}:`, e)
          }
        }
      }
    })

    await Promise.all(notificationPromises)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Notify Engine Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
