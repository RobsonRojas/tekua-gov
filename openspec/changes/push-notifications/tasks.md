## 1. Configuração de Infraestrutura e Chaves

- [ ] 1.1 Gerar chaves VAPID (Pública/Privada) utilizando a ferramenta `web-push` e armazenar de forma segura.
- [ ] 1.2 Adicionar `VITE_VAPID_PUBLIC_KEY` ao arquivo `.env` do projeto.

## 2. Service Worker e Backend (Supabase)

- [ ] 2.1 Criar a migração SQL para a tabela `push_subscriptions` (user_id, endpoint, keys, created_at).
- [ ] 2.2 Desenvolver o Service Worker customizado (`custom-sw.js`) para escutar o evento `push` e exibir a notificação.
- [ ] 2.3 Atualizar o `vite.config.ts` para injetar o Service Worker customizado através do `vite-plugin-pwa`.

## 3. Lógica de UI e Consentimento

- [ ] 3.1 Criar componente de banner/alerta para solicitar permissão de notificações no Dashboard.
- [ ] 3.2 Implementar função `subscribeUser()` para obter a subscrição do navegador e enviar para o Supabase.
- [ ] 3.3 Desenvolver o tratador de cliques na notificação (`notificationclick`) no Service Worker para navegação profunda no portal.
- [ ] 3.4 Adicionar traduções para os textos de consentimento e mensagens no `translation.json`.
