## Context

O sistema de governança da Tekuá depende de ações rápidas dos membros. Frequentemente, decisões precisam ser tomadas em janelas de tempo curtas (ex: 48h). Sem uma forma de alertar os membros de maneira proativa, o engajamento corre o risco de ser baixo. Notificações push resolvem esse problema permitindo o envio de mensagens mesmo quando o aplicativo não está aberto no navegador.

## Goals / Non-Goals

**Goals:**
- Solicitar permissão de notificação para o usuário (PWA).
- Registrar as subscrições (enpoint, keys) em uma tabela segura no Supabase vinculada ao `user_id`.
- Implementar o handler do Service Worker para exibir notificações recebidas em background.
- Garantir que clicar na notificação abra o portal e direcione para o recurso correto (ex: `/voting/123`).

**Non-Goals:**
- Envio de SMS ou WhatsApp (foco restrito a Push Web nativo).
- Customização extrema dos banners de notificação (seguirá o padrão do SO).

## Decisions

- **Protocolo**: Web Push API (Nativo).
- **Service Worker**: Customização do Service Worker injetado pelo `vite-plugin-pwa` (instalação do handler de evento `push`).
- **Backend Trigger**: Utilizar Supabase Edge Functions com a biblioteca `web-push`.
- **Database Schema**:
    - `push_subscriptions`: `(id, profile_id, endpoint, auth, p256dh, timestamp)`.
- **Autenticação**: O frontend deve enviar as credenciais para o Supabase logo após o usuário autorizar no navegador.

## Risks / Trade-offs

- **iOS/Safari Compatibility**: O suporte a push no iOS requer que o site seja adicionado à tela de início (Standalone PWA). A especificação deve incluir instruções visuais de guia para usuários iOS.
- **VAPID Keys Management**: Chaves públicas/privadas precisam ser gerenciadas de forma persistente para evitar que as subscrições se tornem inválidas se as chaves forem trocadas.
- **Battery Impact**: Notificações excessivas podem levar o usuário a revogar as permissões globalmente. Deve haver um controle de frequência.
