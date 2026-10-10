import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

// Sender/recipient for external emails are always fixed.
const FIXED_ADDRESS = 'contato@tekua.com.br'
const RESEND_ENDPOINT = 'https://api.resend.com/emails'

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    // 1. Fetch pending emails
    const { data: queue, error: fetchError } = await supabaseAdmin
      .from('email_queue')
      .select('*')
      .in('status', ['pending', 'failed'])
      .limit(50);

    if (fetchError) throw fetchError;

    const results = { sent: 0, failed: 0, details: [] as any[] };

    for (const item of queue || []) {
      try {
        if (item.type === 'external') {
          // External emails are delivered through the configured email provider (Resend).
          if (!resendApiKey) throw new Error('RESEND_API_KEY is not configured');

          const resendPayload: Record<string, unknown> = {
            from: item.from_email || FIXED_ADDRESS,
            to: item.email || FIXED_ADDRESS,
            subject: item.subject || '(sem assunto)',
            html: item.body || '',
          };
          if (item.reply_to) resendPayload.reply_to = item.reply_to;

          const response = await fetch(RESEND_ENDPOINT, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(resendPayload),
          });

          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Resend ${response.status}: ${errorBody}`);
          }
        } else {
          // Invite flow (unchanged): types other than 'external' are treated as invites.
          const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(item.email, {
            data: { email: item.email } // keep it simple, the original trigger created the profile already
          });

          if (inviteError) throw inviteError;
        }

        // success
        await supabaseAdmin
          .from('email_queue')
          .update({ status: 'sent', error_message: null, updated_at: new Date().toISOString() })
          .eq('id', item.id);

        results.sent++;
        results.details.push({ email: item.email, status: 'sent' });
      } catch (itemError: any) {
        // Isolate failures per item so one bad row does not stop the batch.
        await supabaseAdmin
          .from('email_queue')
          .update({ status: 'failed', error_message: itemError?.message, updated_at: new Date().toISOString() })
          .eq('id', item.id);

        results.failed++;
        results.details.push({ email: item.email, status: 'failed', error: itemError?.message });
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
