## Context

Atualmente as evidências submetidas nas tarefas do work-wall são links diretos para download ou abrem numa nova aba, o que permite aos usuários baixar, copiar ou selecionar o conteúdo das evidências. Isso pode expor dados sensíveis e ferir políticas de privacidade.

## Goals / Non-Goals

**Goals:**
- Proibir o download direto de evidências.
- Criar um modal seguro para exibição de evidências com bloqueio de cópia e seleção (`user-select: none`, desabilitar menu de contexto).
- Remover opções de download nos componentes de listagem de evidências no work-wall.

**Non-Goals:**
- Não iremos impedir o print screen via SO (impossível via browser de forma nativa e 100% segura sem apps dedicados).
- Não iremos refazer o sistema de upload de evidências.

## Decisions

- **Uso de CSS e Eventos JavaScript**: Para prevenir seleções e cópias, usaremos `user-select: none`, `pointer-events: none` em certas camadas (se aplicável), e impediremos o `onContextMenu`. Desabilitaremos atalhos via keydown (Ctrl+S, Ctrl+P, etc).
- **Componente Base**: Criar um `EvidenceViewerModal` inspirado no `DocumentViewerModal` existente, para encapsular essas regras de segurança.

## Risks / Trade-offs

- **Risk:** Usuários com conhecimento técnico podem contornar as travas no front-end inspecionando o DOM.
  - **Mitigation:** Este é um trade-off aceito para visualização via browser padrão. As travas são para impedir ações corriqueiras de usuários comuns.
