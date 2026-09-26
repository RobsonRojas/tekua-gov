## Why

Ao tentar cadastrar um novo membro, o sistema retorna um `HTTP 400: {"data":null,"error":"Error sending invite email"}`. Isso ocorre porque o Supabase Auth tenta disparar um e-mail de convite, mas encontra um bloqueio no servidor SMTP do Gmail.

O problema principal reside na configuração SMTP:
- O remetente configurado é `gov@tekua.com.br`
- A conta SMTP usada (Username) é `contato@tekua.com.br`

Os servidores do Google (Gmail) exigem que o endereço do remetente (Sender email address) seja exatamente igual ao do usuário autenticado (Username) **ou** que o e-mail autenticado (`contato@tekua.com.br`) possua o e-mail do remetente (`gov@tekua.com.br`) configurado como um **alias ("Enviar email como")** nas configurações do Gmail. Sem isso, o Gmail recusa o envio da mensagem. 

Além de ser necessário corrigir as configurações diretamente no painel do Supabase, precisamos melhorar a edge function `api-members` para capturar falhas de SMTP e fornecer uma mensagem de erro mais clara ao administrador (ex: indicando que a falha foi no servidor de email).

## Capabilities

### New Capabilities
- `email_queue`: Uma fila de envio no banco de dados para armazenar convites de e-mail que falharam devido a erros no SMTP.
- `cron_retry_emails`: Um módulo que faz tentativas periódicas de reenvio de e-mails para limpar a fila.
- `admin_email_queue_panel`: Um painel administrativo para exibir e gerenciar a fila de envios pendentes.

### Modified Capabilities
- `api-members`: Tratamento de erro aprimorado no bloco de convite de usuários para capturar falhas de disparo de email (como limites de taxa ou credenciais SMTP inválidas) e inserir os dados na `email_queue`. A falha no envio do e-mail não deve impedir a conclusão do cadastro do usuário.
## Impact

- `supabase/functions/api-members/index.ts` (modificar para inserir na fila em caso de falha)
- Nova migration no banco de dados para a tabela da fila de e-mails.
- Nova função ou rotina (`cron_retry_emails`) para o reenvio periódico.
- Nova interface no frontend para o painel administrativo da fila.
- É necessária uma ação manual no painel de controle do Supabase para corrigir os dados de SMTP.
