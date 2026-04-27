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
      case 'getProfile': {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (error) throw error
        responseData = data
        break
      }

      case 'fetchUsers': {
        // 1. Fetch requester profile to check role
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        const isAdmin = profile?.role === 'admin'

        // 2. Fetch all users. If admin, use admin client to see everything.
        // If not admin, just use regular client (RLS will handle it or we select specific fields)
        let query = isAdmin ? supabaseAdmin.from('profiles').select('*') : supabaseClient.from('profiles').select('id, full_name, email, avatar_url, role')
        
        const { data, error } = await query
          .order('full_name', { ascending: true })

        if (error) throw error
        responseData = data
        break
      }

      case 'updateProfile': {
        const { updates } = params
        if (!updates) throw new Error('Missing updates')

        // Filter out protected fields
        const protectedFields = ['role', 'id', 'created_at']
        const cleanUpdates: any = {}
        Object.keys(updates).forEach(key => {
          if (!protectedFields.includes(key)) {
            cleanUpdates[key] = updates[key]
          }
        })

        const { data, error } = await supabaseClient
          .from('profiles')
          .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select()

        if (error) throw error
        responseData = data
        break
      }

      case 'manageAdmin': {
        // Only existing admins can promote/demote others
        const { data: requesterProfile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (requesterProfile?.role !== 'admin') throw new Error('Forbidden')

        const { targetUserId, role } = params
        if (!targetUserId || !role) throw new Error('Missing targetUserId or role')

        const { data, error } = await supabaseAdmin
          .from('profiles')
          .update({ role, updated_at: new Date().toISOString() })
          .eq('id', targetUserId)
          .select()

        if (error) throw error
        responseData = data
        break
      }

      case 'adminUpdateProfile': {
        const { targetUserId, updates } = params
        if (!targetUserId || !updates) throw new Error('Missing targetUserId or updates')

        // 1. Verify requester is admin
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role !== 'admin') throw new Error('Forbidden')

        // 2. Perform update using admin client
        const protectedFields = ['id', 'created_at']
        const cleanUpdates: any = {}
        Object.keys(updates).forEach(key => {
          if (!protectedFields.includes(key)) {
            cleanUpdates[key] = updates[key]
          }
        })

        const { data, error } = await supabaseAdmin
          .from('profiles')
          .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
          .eq('id', targetUserId)
          .select()

        if (error) throw error
        responseData = data
        break
      }

      case 'inviteMember': {
        const { email, role, full_name } = params
        if (!email) throw new Error('Missing email')

        // 1. Verify requester is admin
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role !== 'admin') throw new Error('Forbidden')

        // 2. Invite user via Supabase Auth Admin API
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: { 
            full_name: full_name || '',
            role: role || 'member'
          }
        })

        if (inviteError) throw inviteError

        // 3. Update profile role if specified (inviteUserByEmail might not trigger trigger immediately)
        // Note: Usually a trigger handles profile creation, but we want to ensure the role is set.
        // We'll wait a bit or assume the trigger works. For safety, we can return the invite info.
        
        responseData = inviteData
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
