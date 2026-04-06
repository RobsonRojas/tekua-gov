## Context

O portal Tekua Governance é acessado principalmente via navegador. Para oferecer uma experiência mais robusta e "nativa" em dispositivos móveis, é necessário implementar as tecnologias de Progressive Web App (PWA). A aplicação já utiliza `vite`, o que facilita a integração de service workers e manifestos através de plugins específicos.

## Goals / Non-Goals

**Goals:**
- Tornar a aplicação instalável em Android e iOS.
- Fornecer um manifesto web com ícones e cores da marca.
- Implementar cache básico de ativos estáticos para carregamento rápido.
- Garantir que a aplicação funcione em modo "standalone" (sem interface de navegador).

**Non-Goals:**
- Implementar funcionalidade offline completa para dados dinâmicos (banco de dados do Supabase).
- Sincronização offline complexa nesta fase inicial.

## Decisions

- **Ferramenta**: `vite-plugin-pwa`. Este plugin automatiza a geração do `manifest.json` e do Service Worker.
- **Service Worker**: Estratégia `generateSW` (precache de ativos gerados pelo build).
- **Manifesto**:
  - `short_name`: "Tekua Gov"
  - `name`: "Tekua Governance Portal"
  - `theme_color`: #1976d2 (cor primária atual).
  - `background_color`: #ffffff.
  - `display`: "standalone".
- **Ícones**: Utilizar o `generate_image` para criar ícones genéricos mas profissionais se não houver ativos disponíveis, ou usar as artes atuais da Tekua.
- **Registro**: Utilizar registro automático (`registerType: 'autoUpdate'`).

## Risks / Trade-offs

- **Atualizações**: PWAs podem sofrer com cache agressivo; é preciso garantir que o usuário receba novas versões da aplicação (estratégia de "prompt for update" ou "autoUpdate").
- **iOS Support**: O suporte a PWA no iOS é limitado em comparação ao Android (ex: manifestos às vezes exigem meta tags específicas no HTML).
