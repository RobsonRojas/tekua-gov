import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-key',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Security check: Either a custom secret or verify requester is an existing admin
    // For bootstrapping, we'll use a custom secret from environment variables
    const adminKey = req.headers.get('x-admin-key')
    const masterKey = Deno.env.get('ADMIN_MANAGEMENT_KEY')

    if (!adminKey || adminKey !== masterKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid admin key' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { email, password, full_name, action } = await req.json()

    if (!email || !action) {
      throw new Error('Email and action are required')
    }

    let userId: string

    if (action === 'create') {
      if (!password) throw new Error('Password is required for creation')
      
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name }
      })

      if (authError) throw authError
      userId = authData.user.id
    } else if (action === 'update') {
      // Find user by email
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      if (listError) throw listError
      
      const user = listData.users.find(u => u.email === email)
      if (!user) throw new Error('User not found')
      userId = user.id

      if (password) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password })
        if (updateError) throw updateError
      }
    } else {
      throw new Error('Invalid action. Use "create" or "update"')
    }

    // Ensure profile has admin role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: userId, 
        full_name, 
        role: 'admin',
        updated_at: new Date().toISOString()
      })

    if (profileError) throw profileError

    return new Response(JSON.stringify({ 
      message: `User ${email} successfully ${action}d as admin`,
      userId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
