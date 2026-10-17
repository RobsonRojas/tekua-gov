## 1. Backend & Supabase (VAPID)

- [x] 1.1 Criar rotina para gerar as chaves VAPID (Public/Private) ou configurar variáveis de ambiente correspondentes (ex: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`).
- [x] 1.2 Criar tabela/migration no Supabase (`push_subscriptions`) contendo as colunas `endpoint`, `p256dh`, `auth` e `user_id` (se ainda não existir com essa estrutura).
- [x] 1.3 Implementar Edge Function (ou atualizar backend Node/Deno) utilizando a biblioteca `web-push` para disparar as notificações para os endpoints registrados.

## 2. Frontend - Web & PWA (Service Worker)

- [x] 2.1 Criar ou atualizar o arquivo `sw.js` (Service Worker) em `public/` para escutar o evento `push` e exibir a notificação (`self.registration.showNotification`).
- [x] 2.2 Adicionar lógica no frontend para solicitar permissão de notificação (soft prompt) e registrar o Service Worker usando a VAPID Public Key.
- [x] 2.3 Após o usuário aceitar, obter a assinatura (Subscription) pelo `pushManager.subscribe` e enviá-la para a API para ser salva na tabela `push_subscriptions`.

## 3. Orquestração de Notificações

- [x] 3.1 Modificar o motor de notificações atual para, ao disparar uma notificação, buscar todas as `push_subscriptions` associadas ao usuário no banco.
- [x] 3.2 Iterar sobre as assinaturas e chamar a função de envio Web Push, lidando adequadamente com assinaturas inválidas/expiradas (removendo-as do banco caso retornem erro 410 Gone).

## 4. Validação

- [x] 4.1 Rodar a validação de build (`npm run build`, `npm run typecheck`) para garantir que tudo compila com as novas regras da workspace.
