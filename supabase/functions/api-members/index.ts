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
      key: `api:members:${user.id}`,
      limit: 50, // 50 req per minute for members API
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

      case 'fetchUser': {
        const { userId } = params
        if (!userId) throw new Error('Missing userId')

        // 1. Fetch requester profile to check roles
        const { data: requesterProfile } = await supabaseClient
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single()
        
        const isAdmin = requesterProfile?.roles?.includes('admin')
        
        // 2. Security check: Only admins can fetch other users. 
        // Members can only fetch themselves.
        if (!isAdmin && userId !== user.id) {
          throw new Error('Forbidden')
        }

        // 3. Fetch user. Use admin client if admin, to bypass RLS and see all details.
        const query = isAdmin ? supabaseAdmin : supabaseClient
        const { data, error } = await query
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (error) throw error
        responseData = data
        break
      }

      case 'fetchUsers': {
        // 1. Fetch requester profile to check role
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single()
        
        const isAdmin = profile?.roles?.includes('admin')

        // 2. Fetch all users. If admin, use admin client to see everything.
        // If not admin, just use regular client (RLS will handle it or we select specific fields)
        let query = isAdmin ? supabaseAdmin.from('profiles').select('*') : supabaseClient.from('profiles').select('id, full_name, email, avatar_url, roles, functions')
        
        const { data, error } = await query
          .order('full_name', { ascending: true })

        if (error) throw error
        responseData = data
        break
      }

      case 'fetchUsersWithBalances': {
        // 1. Fetch requester profile to check role
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single()
        
        const isAdmin = profile?.roles?.includes('admin')
        if (!isAdmin) throw new Error('Forbidden')

        // 2. Fetch all users with wallets
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('*, wallet:wallets(balance)')
          .order('full_name', { ascending: true })

        if (error) throw error

        // 3. Map result
        responseData = data.map((u: any) => {
          const balanceArray = Array.isArray(u.wallet) ? u.wallet : (u.wallet ? [u.wallet] : []);
          const balanceObj = balanceArray[0];
          return {
            ...u,
            surreal_balance: balanceObj?.balance ?? 0
          }
        })
        break
      }

      case 'fetchEconomyStats': {
        // 1. Fetch requester profile to check role
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single()
        
        const isAdmin = profile?.roles?.includes('admin')
        if (!isAdmin) throw new Error('Forbidden')

        // Fetch Treasury Balance (wallet where profile_id IS NULL)
        const { data: treasuryData } = await supabaseAdmin
          .from('wallets')
          .select('balance')
          .is('profile_id', null)
          .single()
        const treasuryBalance = treasuryData?.balance || 0;

        // Fetch Total In Circulation
        const { data: circulatingData } = await supabaseAdmin
          .from('wallets')
          .select('balance')
          .not('profile_id', 'is', null)
        const totalCirculating = (circulatingData || []).reduce((acc: number, w: any) => acc + (w.balance || 0), 0);

        // Total Transactions
        const { count: totalTransactions } = await supabaseAdmin
          .from('ledger_entries')
          .select('*', { count: 'exact', head: true })

        // Top 10 Contributors
        // Since Supabase REST doesn't easily support GROUP BY with JOIN in a single call without RPC, 
        // we'll fetch activities, group them in JS, or use a custom query.
        // Wait, standard supabase js doesn't have group by. 
        // Let's use RPC if available, or just fetch all completed activities and group in JS (assuming small scale for now).
        const { data: activitiesData } = await supabaseAdmin
          .from('activities')
          .select('worker_id')
          .eq('status', 'completed')
          .not('worker_id', 'is', null)

        const contributorCounts: Record<string, number> = {}
        if (activitiesData) {
          activitiesData.forEach((a: any) => {
            contributorCounts[a.worker_id] = (contributorCounts[a.worker_id] || 0) + 1
          })
        }
        const topContributorIds = Object.entries(contributorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
        
        const topContributors = [];
        if (topContributorIds.length > 0) {
          const { data: contributorsProfiles } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, avatar_url, wallet:wallets(balance)')
            .in('id', topContributorIds.map(t => t[0]))
          
          if (contributorsProfiles) {
            topContributorIds.forEach(([id, count], index) => {
              const p = contributorsProfiles.find((p: any) => p.id === id)
              if (p) {
                const balanceArray = Array.isArray(p.wallet) ? p.wallet : (p.wallet ? [p.wallet] : []);
                const balanceObj = balanceArray[0];
                topContributors.push({
                  position: index + 1,
                  id: p.id,
                  full_name: p.full_name,
                  avatar_url: p.avatar_url,
                  completed_tasks: count,
                  surreal_balance: balanceObj?.balance ?? 0
                })
              }
            })
          }
        }

        // Top 10 Holders
        const { data: topHoldersData } = await supabaseAdmin
          .from('wallets')
          .select('profile_id, balance, profile:profiles(id, full_name, avatar_url)')
          .not('profile_id', 'is', null)
          .order('balance', { ascending: false })
          .limit(10)

        const topHolders = (topHoldersData || []).map((w: any, idx: number) => ({
          position: idx + 1,
          id: w.profile_id,
          full_name: w.profile?.full_name,
          avatar_url: w.profile?.avatar_url,
          surreal_balance: w.balance
        }))

        responseData = {
          totalCirculating,
          treasuryBalance,
          totalTransactions: totalTransactions || 0,
          topContributors,
          topHolders
        }
        break
      }

      case 'updateProfile': {
        const { updates } = params
        if (!updates) throw new Error('Missing updates')

        // Filter out protected fields
        const protectedFields = ['roles', 'id', 'created_at', 'functions', 'role', 'is_board_member', 'board_role']
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
          .select('roles')
          .eq('id', user.id)
          .single()
        
        if (!requesterProfile?.roles?.includes('admin')) throw new Error('Forbidden')

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
          .select('roles')
          .eq('id', user.id)
          .single()
        
        if (!profile?.roles?.includes('admin')) throw new Error('Forbidden')

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

      case 'removeMember': {
        const { targetUserId } = params
        if (!targetUserId) throw new Error('Missing targetUserId')

        // 1. Verify requester is admin
        const { data: requesterProfile } = await supabaseClient
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single()
        
        if (!requesterProfile?.roles?.includes('admin')) throw new Error('Forbidden')

        // 2. Prevent self-deletion
        if (targetUserId === user.id) throw new Error('You cannot remove your own access')

        // 3. Delete user from Auth (this will cascade to profiles)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)
        if (deleteError) {
          console.error(`Error deleting user ${targetUserId}:`, deleteError)
          // Provide a more descriptive message if it's a constraint error
          if (deleteError.message?.includes('foreign key constraint')) {
            throw new Error('Cannot remove user because they are linked to existing data (announcements, audits, etc.)')
          }
          throw deleteError
        }

        responseData = { success: true }
        break
      }

      case 'inviteMember': {
        const { email, roles, full_name, functions, avatar_url } = params
        if (!email) throw new Error('Missing email')

        // 1. Verify requester is admin
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single()
        
        if (!profile?.roles?.includes('admin')) throw new Error('Forbidden')

        // 2. Invite user via Supabase Auth Admin API
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: { 
            full_name: full_name || '',
            email: email, // ensure email is passed in meta data
            roles: roles || ['member'],
            functions: functions || [],
            avatar_url: avatar_url || null,
            // Legacy fields for backward compatibility
            role: roles ? roles[0] : 'member',
            is_board_member: functions ? functions.length > 0 : false,
            board_role: functions ? functions[0] : null
          }
        })

        if (inviteError) throw inviteError

        // 3. Update profile email to ensure it's saved in the profiles table
        if (inviteData?.user?.id) {
          await supabaseAdmin
            .from('profiles')
            .update({ 
              email: email,
              avatar_url: avatar_url || null
            })
            .eq('id', inviteData.user.id);
        }

        responseData = inviteData
        break
      }

      case 'adminUpdatePassword': {
        const { targetUserId, newPassword } = params
        if (!targetUserId || !newPassword) throw new Error('Missing targetUserId or newPassword')

        // 1. Verify requester is admin
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single()
        
        if (!profile?.roles?.includes('admin')) throw new Error('Forbidden')

        // 2. Perform password update using admin client
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
          targetUserId,
          { password: newPassword }
        )

        if (error) throw error
        responseData = { success: true }
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
