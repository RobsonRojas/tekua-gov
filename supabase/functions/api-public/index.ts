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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Rate Limiting by IP for public endpoints
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = await checkRateLimit(supabaseClient, {
      key: `api:public:${clientIp}`,
      limit: 10, // 10 req per minute for public API
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
      case 'getTaskByInviteToken': {
        const { inviteToken } = params;
        if (!inviteToken) throw new Error('Missing inviteToken');

        // We can just use the anon client since RLS allows select on activities
        // But we want to make sure it's valid and open
        const { data, error } = await supabaseClient
          .from('activities')
          .select('id, title, description, reward_amount, status, worker_id, type')
          .eq('invite_token', inviteToken)
          .single();

        if (error) throw error;
        
        if (data.status !== 'open' || data.worker_id !== null) {
          throw new Error('This task is no longer available or has already been claimed.');
        }

        responseData = data;
        break;
      }

      case 'registerWithInviteToken': {
        const { inviteToken, email, password, fullName } = params;
        if (!inviteToken || !email || !password || !fullName) {
          throw new Error('Missing required fields');
        }

        // 1. Verify the task is still open
        const { data: task, error: taskError } = await supabaseClient
          .from('activities')
          .select('id, status, worker_id')
          .eq('invite_token', inviteToken)
          .single();

        if (taskError) throw taskError;
        if (task.status !== 'open' || task.worker_id !== null) {
          throw new Error('This task is no longer available or has already been claimed.');
        }

        // 2. Create the user using admin client (bypassing normal signup restrictions)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName
          }
        });

        if (authError) {
          // Check if it's an existing user
          if (authError.message.includes('already registered')) {
            throw new Error('User already exists. Please login and use the invite link from inside the platform.');
          }
          throw authError;
        }

        const newUserId = authData.user.id;

        // 3. Set profile roles (since default might be empty, ensure they are a member)
        await supabaseAdmin
          .from('profiles')
          .update({
            roles: ['member'],
            role: 'member',
            full_name: fullName
          })
          .eq('id', newUserId);

        // 4. Assign the user as the worker for the task and update status
        const { error: assignError } = await supabaseAdmin
          .from('activities')
          .update({
            worker_id: newUserId,
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (assignError) {
          // If we failed to assign, the user was created but task failed.
          // In a real production system we'd use a transaction or rollback.
          console.error('Failed to assign task after user creation', assignError);
          throw assignError;
        }

        responseData = { success: true, userId: newUserId, taskId: task.id };
        break;
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
