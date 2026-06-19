## 1. Pesquisa e Preparação

- [x] 1.1 Localizar o fluxo atual de criação de pautas (agendas) no frontend/backend ou as queries do Supabase relacionadas.
- [x] 1.2 Identificar o serviço de envio de email atual utilizado pelo sistema (ex: Resend, hooks de autenticação ou edge functions).

## 2. Backend / Edge Function

- [x] 2.1 Criar a função responsável por obter a lista de emails dos membros elegíveis a serem notificados.
- [x] 2.2 Implementar a função de envio de email de notificação com o template base contendo título da pauta e o link.
- [x] 2.3 Integrar o envio de email de forma assíncrona logo após a inserção da nova pauta no banco de dados.

## 3. Testes e Validação

- [x] 3.1 Testar localmente a criação de uma pauta simulando o envio de email para não disparar em produção ou usar logs.
- [x] 3.2 Verificar que a inserção da pauta não é bloqueada caso o envio de email falhe isoladamente.
