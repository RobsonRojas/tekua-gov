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

      case 'sendResetPasswordOtp': {
        const { email } = params;
        if (!email) throw new Error('E-mail é obrigatório');

        // 1. Verify user exists in profiles
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (profileError || !profile) {
          throw new Error('Usuário não cadastrado na plataforma.');
        }

        // 2. Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Persist OTP in database
        const { error: insertError } = await supabaseAdmin
          .from('password_reset_otps')
          .insert({
            email,
            otp,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // Valid for 10 minutes
          });

        if (insertError) throw insertError;

        // 4. Send Email via Resend
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (resendApiKey) {
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: 'Tekuá Governança <alertas@tekua.org>',
              to: email,
              subject: 'Código de Confirmação para Redefinição de Senha',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                  <h2 style="color: #6366f1; text-align: center;">Redefinição de Senha</h2>
                  <p>Olá,</p>
                  <p>Você solicitou a alteração de sua senha no portal Tekuá Governança. Use o código de uso único (OTP) abaixo para confirmar a alteração:</p>
                  <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; padding: 18px; background-color: #f8fafc; text-align: center; border-radius: 8px; margin: 24px 0; color: #4f46e5; border: 1px dashed #6366f1;">
                    ${otp}
                  </div>
                  <p>Este código expira em 10 minutos. Se você não solicitou esta alteração, por favor ignore este e-mail.</p>
                  <hr style="margin-top: 30px; border: 0; border-top: 1px solid #e2e8f0;" />
                  <p style="font-size: 12px; color: #64748b; text-align: center;">Este é um e-mail automático da Tekuá. Não responda a esta mensagem.</p>
                </div>
              `
            })
          });

          if (!emailRes.ok) {
            const errText = await emailRes.text();
            console.error('Failed to send Resend email:', errText);
            throw new Error(`Falha ao enviar e-mail: ${errText}`);
          }
        } else {
          console.log(`[DEV] Generated OTP for ${email}: ${otp}`);
        }

        responseData = { success: true };
        break;
      }

      case 'confirmResetPasswordWithOtp': {
        const { email, otp, newPassword } = params;
        if (!email || !otp || !newPassword) {
          throw new Error('Campos obrigatórios ausentes');
        }

        // 1. Validate the OTP in the database
        const { data: otpRecord, error: otpError } = await supabaseAdmin
          .from('password_reset_otps')
          .select('*')
          .eq('email', email)
          .eq('otp', otp)
          .eq('used', false)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (otpError || !otpRecord) {
          throw new Error('Código de confirmação (OTP) inválido ou expirado.');
        }

        // 2. Mark OTP as used
        const { error: markError } = await supabaseAdmin
          .from('password_reset_otps')
          .update({ used: true })
          .eq('id', otpRecord.id);

        if (markError) throw markError;

        // 3. Find user profile to get their ID
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (profileError || !profile) {
          throw new Error('Usuário correspondente não encontrado.');
        }

        // 4. Update the password using admin auth client
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
          password: newPassword
        });

        if (updateError) throw updateError;

        // 5. Send safety confirmation email
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (resendApiKey) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
              },
              body: JSON.stringify({
                from: 'Tekuá Governança <alertas@tekua.org>',
                to: email,
                subject: 'Alerta de Segurança: Senha Alterada com Sucesso',
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #10b981; text-align: center;">Senha Alterada com Sucesso</h2>
                    <p>Olá,</p>
                    <p>A senha do seu cadastro no portal Tekuá Governança foi alterada com sucesso.</p>
                    <p>Se você realizou essa alteração, nenhuma ação adicional é necessária. Sua nova senha já está ativa.</p>
                    <p style="color: #ef4444; font-weight: bold;">IMPORTANTE: Se você NÃO realizou essa alteração, entre em contato imediatamente com os administradores da plataforma para proteger sua conta.</p>
                    <hr style="margin-top: 30px; border: 0; border-top: 1px solid #e2e8f0;" />
                    <p style="font-size: 12px; color: #64748b; text-align: center;">Este é um e-mail automático da Tekuá. Não responda a esta mensagem.</p>
                  </div>
                `
              })
            });
          } catch (mailErr) {
            console.error('Failed to send confirmation email:', mailErr);
          }
        }

        responseData = { success: true };
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
