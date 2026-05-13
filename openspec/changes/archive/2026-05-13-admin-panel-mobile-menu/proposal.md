## Why

O Painel Administrativo possui muitas abas (Usuários, Configuração, Docs, Financeiro, Auditoria, Histórico), o que resulta em uma barra de abas muito longa que exige rolagem lateral excessiva em dispositivos móveis. Transformar esta navegação em um menu contextual compacto melhorará significativamente a experiência dos administradores que utilizam smartphones para tarefas rápidas.

## What Changes

- Substituição do componente de `Tabs` por um botão de menu no Painel Admin quando visualizado em dispositivos móveis (`xs`).
- Implementação de um `Menu` para seleção da aba administrativa ativa.
- Sincronização do estado do menu com os `searchParams` da URL (mantendo o comportamento atual de deep linking).
- Exibição do nome e ícone da aba selecionada no botão de menu.

## Capabilities

### New Capabilities
- `admin-panel-responsive-navigation`: Requisitos de navegação para as ferramentas administrativas em dispositivos móveis.

### Modified Capabilities
- `navigation-interface`: Expansão do padrão de navegação contextual para interfaces administrativas.

## Impact

- `src/pages/AdminPanel.tsx`: Refatoração da lógica de abas para suportar o seletor mobile.
- UX: Redução da carga cognitiva e melhoria na acessibilidade tátil para administradores em campo.
