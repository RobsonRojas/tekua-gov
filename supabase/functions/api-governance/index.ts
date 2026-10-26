import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { canCancelCircle, canCloseCircle, validateNewCircle } from "./circleRules.ts"

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

      case 'createRestorativeCircle': {
        const { title, description, scheduledAt, locationOrLink, confirmedPreCircles } = params
        const checked = validateNewCircle({ title, scheduledAt, confirmedPreCircles }, Date.now())
        if (!checked.ok) throw new Error(checked.error)
        const cleanTitle = checked.title

        const { data, error } = await supabaseClient
          .from('restorative_circles')
          .insert([{
            title: cleanTitle,
            description: typeof description === 'string' && description.trim() ? description.trim() : null,
            scheduled_at: checked.scheduledAt,
            location_or_link: typeof locationOrLink === 'string' && locationOrLink.trim() ? locationOrLink.trim() : null,
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
          .select('id, title, description, scheduled_at, location_or_link, status, share_token, created_at')
          .eq('share_token', token)
          .maybeSingle()

        if (error) throw error
        if (!data) throw new Error('Restorative circle not found')
        responseData = data
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
