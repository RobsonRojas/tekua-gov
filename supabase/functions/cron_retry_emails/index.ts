import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch pending emails
    const { data: queue, error: fetchError } = await supabaseAdmin
      .from('email_queue')
      .select('*')
      .in('status', ['pending', 'failed'])
      .limit(50);

    if (fetchError) throw fetchError;

    const results = { sent: 0, failed: 0, details: [] as any[] };

    for (const item of queue || []) {
      // 2. Tentar reenviar
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(item.email, {
        data: { email: item.email } // keep it simple, the original trigger created the profile already
      });

      if (inviteError && (inviteError.message?.includes('Error sending invite email') || inviteError.message?.includes('SMTP'))) {
        // failed again
        await supabaseAdmin
          .from('email_queue')
          .update({ status: 'failed', error_message: inviteError.message, updated_at: new Date().toISOString() })
          .eq('id', item.id);
        
        results.failed++;
        results.details.push({ email: item.email, status: 'failed', error: inviteError.message });
      } else if (inviteError) {
        // Some other error, maybe user already exists and is active?
        await supabaseAdmin
          .from('email_queue')
          .update({ status: 'failed', error_message: inviteError.message, updated_at: new Date().toISOString() })
          .eq('id', item.id);
        
        results.failed++;
        results.details.push({ email: item.email, status: 'failed', error: inviteError.message });
      } else {
        // success
        await supabaseAdmin
          .from('email_queue')
          .update({ status: 'sent', error_message: null, updated_at: new Date().toISOString() })
          .eq('id', item.id);
        
        results.sent++;
        results.details.push({ email: item.email, status: 'sent' });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: queue?.length || 0, results }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
