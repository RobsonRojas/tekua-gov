import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

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

    let responseData: any = null

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
        if (topic.status !== 'active') throw new Error('This topic is no longer accepting votes')

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
        responseData = vote
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

        const { title, content } = params
        const { data, error } = await supabaseAdmin
          .from('discussion_topics')
          .insert([{ 
            title, 
            content, 
            status: 'active',
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

        // 2. Fetch Comments
        const { data: comments, error: commentsError } = await supabaseClient
          .from('topic_comments')
          .select('*, profiles(full_name, avatar_url)')
          .eq('topic_id', id)
          .order('created_at', { ascending: true })
        
        if (commentsError) throw commentsError

        // 3. Fetch Votes Stats
        const { data: votes, error: votesError } = await supabaseClient
          .from('topic_votes')
          .select('option, user_id')
          .eq('topic_id', id)
        
        if (votesError) throw votesError

        const stats = { yes: 0, no: 0, abstain: 0 }
        let userVoted = false
        votes.forEach(v => {
          if (v.option === 'yes') stats.yes++
          if (v.option === 'no') stats.no++
          if (v.option === 'abstain') stats.abstain++
          if (v.user_id === user.id) userVoted = true
        })

        responseData = { topic, comments, stats, userVoted }
        break
      }

      case 'addComment': {
        const { topicId, content } = params
        if (!topicId || !content) throw new Error('Missing topicId or content')

        const { data, error } = await supabaseClient
          .from('topic_comments')
          .insert([{ 
            topic_id: topicId, 
            user_id: user.id, 
            content 
          }])
          .select()

        if (error) throw error
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
