# Design: Fix Member Invite SMTP Errors

## Architecture/Component Changes

1. **Database (`email_queue`)**: Nova tabela para armazenar convites pendentes.
2. **Edge Function (`api-members`)**: Modificada para não bloquear o cadastro. Em caso de erro de envio, registra na fila.
3. **Cron Job / Edge Function (`cron_retry_emails`)**: Nova rotina para ler a fila e reenviar os emails periodicamente usando `pg_cron` no Supabase ou uma Edge Function agendada.
4. **Painel Administrativo**: Nova página ou componente no frontend para visualizar e reprocessar manualmente a `email_queue`.

## Technical Details

1. **`email_queue` Table**:
   - `id` (uuid, primary key)
   - `email` (text)
   - `status` (text, ex: 'pending', 'failed', 'sent')
   - `error_message` (text)
   - `created_at` (timestamp)

2. **`supabase/functions/api-members/index.ts`**:
   - Tentar criar o usuário (`inviteUserByEmail`).
   - Se ocorrer um `inviteError` e o usuário já tiver sido criado, ou se o erro for apenas de SMTP ("Error sending invite email"), registrar o e-mail na tabela `email_queue`.
   - Omitir o erro de SMTP da resposta HTTP para o cliente, retornando sucesso (200), permitindo que o cadastro do membro seja concluído no lado do cliente.

3. **`cron_retry_emails`**:
   - Uma Edge Function configurada no `supabase/functions` com o `pg_cron` (ou usando trigger HTTP agendado) para buscar registros onde `status = 'pending'` ou `status = 'failed'`.
   - Para cada registro, tentar `admin.auth.admin.inviteUserByEmail`. Se sucesso, atualizar `status = 'sent'`.

4. **Painel Administrativo**:
   - Componente Frontend que consome a tabela `email_queue`.
   - Exibe a lista de e-mails com falha.
   - Permite acionar um reenvio manual chamando uma função ou atualizando o status.

## Non-Code Actions
Além de implantar a correção de log/erro na função, o administrador deve:
1. Ir ao Dashboard do Supabase > Project Settings > Authentication > SMTP para configurar o servidor adequadamente.
