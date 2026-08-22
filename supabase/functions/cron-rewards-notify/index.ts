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
    // Verify authorization - cron should pass a secret
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
        // Fallback for manual invocation with service key if CRON_SECRET is not set
        if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
            return new Response('Unauthorized', { status: 401 })
        }
    }

    console.log(`Starting CRON rewards notification...`)

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

    // 1. Get active rewards with deadlines within 3 days
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    
    const { data: endingRewards, error } = await supabaseClient
      .from('rewards')
      .select('*')
      .eq('status', 'active')
      .not('deadline', 'is', null)
      .lte('deadline', threeDaysFromNow.toISOString())
      .gte('deadline', new Date().toISOString())

    if (error) {
        throw new Error(`Error fetching rewards: ${error.message}`)
    }

    if (!endingRewards || endingRewards.length === 0) {
        return new Response(JSON.stringify({ success: true, message: 'No rewards ending soon.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // Process each reward
    for (const reward of endingRewards) {
        // Find users who have NOT achieved this reward yet
        const { data: usersWithoutReward, error: usrErr } = await supabaseClient
            .from('profiles')
            .select('id, email')
            // Using a left join conceptually, but we can just query users not in user_rewards for this reward
            
        if (usrErr) continue;

        const { data: achievedUsers } = await supabaseClient
            .from('user_rewards')
            .select('user_id')
            .eq('reward_id', reward.id)

        const achievedSet = new Set(achievedUsers?.map(ur => ur.user_id))
        const targetUsers = usersWithoutReward?.filter(u => !achievedSet.has(u.id)) || []

        if (targetUsers.length === 0) continue;

        console.log(`Sending reminders for reward ${reward.title} to ${targetUsers.length} users.`)

        const template = {
            subject: `⏳ Últimos dias para conquistar: ${reward.title}!`,
            body: `A campanha "${reward.title}" está acabando! Acesse a Work Wall, complete tarefas e acumule Surreais suficientes (${reward.cost} $S) antes do dia ${new Date(reward.deadline).toLocaleDateString()}.`,
            pushTitle: 'Últimos Dias do Prêmio!',
            pushBody: `Corra! ${reward.title} expira em breve.`,
            link: `/rewards/${reward.id}/ranking`
        }

        const baseUrl = 'https://tekua-gov.vercel.app'
        
        for (const user of targetUsers) {
            // Push Notification
            const { data: subs } = await supabaseClient
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', user.id)

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
                    } catch (e: any) {
                        if (e.statusCode === 410 || e.statusCode === 404) {
                            await supabaseClient.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
                        }
                    }
                }
            }

            // Email via Resend
            if (resendApiKey && user.email) {
                const emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #f59e0b;">⏳ Últimos dias para o prêmio: ${reward.title}</h2>
                    <p style="color: #333; line-height: 1.6;">${template.body}</p>
                    <div style="margin-top: 30px; text-align: center;">
                        <a href="${baseUrl}${template.link}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Ver Ranking e Detalhes
                        </a>
                    </div>
                </div>
                `
                try {
                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${resendApiKey}`
                        },
                        body: JSON.stringify({
                            from: 'Tekuá Campanhas <campanhas@tekua.org>',
                            to: user.email,
                            subject: template.subject,
                            html: emailHtml
                        })
                    })
                } catch (e) {
                    console.error(`Email delivery failed for user ${user.id}:`, e)
                }
            }
        }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Cron Rewards Notify Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
