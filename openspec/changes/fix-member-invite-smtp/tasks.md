## 1. Banco de Dados

- [x] 1.1 Criar uma migration no Supabase (`npx supabase migration new create_email_queue_table`).
- [x] 1.2 Na migration, definir a criação da tabela `email_queue` com as colunas (id, email, status, error_message, created_at).
- [ ] 1.3 Rodar a migration localmente (`npx supabase db push`).

## 2. Tratamento de Erros na Função Edge (`api-members`)

- [x] 2.1 Em `supabase/functions/api-members/index.ts`, capturar o erro `inviteError`.
- [x] 2.2 Se o erro for relacionado a falha no envio de e-mail ("Error sending invite email"), inserir os dados do e-mail na tabela `email_queue` com status 'pending'.
- [x] 2.3 Alterar a resposta da API para retornar sucesso, de forma que a falha no e-mail não impeça o cadastro do usuário.

## 3. Função de Reenvio Periódico (`cron_retry_emails`)

- [x] 3.1 Criar uma nova Edge Function `npx supabase functions new cron_retry_emails`.
- [x] 3.2 Implementar a lógica para buscar os registros em `email_queue` com status 'pending' ou 'failed' e tentar reenviar com `inviteUserByEmail`.
- [x] 3.3 Atualizar o status do registro na tabela após o reenvio (sucesso ou falha).
- [x] 3.4 (Opcional) Configurar um cron no Supabase (ex: via `pg_cron` ou hook agendado).

## 4. Painel Administrativo

- [x] 4.1 Criar a interface/página no frontend para gerenciar a fila de e-mails pendentes.
- [x] 4.2 Listar os dados da tabela `email_queue`.
- [x] 4.3 (Opcional) Adicionar botão de reenvio manual que acione a re-tentativa.

## 5. Validação

- [x] 5.1 Verificar se o código não quebrou os tipos TypeScript.
- [x] 5.2 Fazer o deploy das funções: `npx supabase functions deploy api-members` e `npx supabase functions deploy cron_retry_emails`.
- [x] 5.3 Simular um erro SMTP e verificar se a fila recebe o registro e o usuário é cadastrado sem interrupções.
