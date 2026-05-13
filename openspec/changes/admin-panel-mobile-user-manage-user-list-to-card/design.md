## Context

A aba de gerenciamento de usuários no `AdminPanel.tsx` é uma das áreas mais críticas para a operação da associação. Atualmente, ela renderiza uma `Table` que se torna ilegível em telas menores que 600px.

## Goals / Non-Goals

**Goals:**
- Implementar uma visualização de lista de cards para mobile.
- Reutilizar todos os componentes de UI existentes (Avatar, Chip, IconButton).
- Manter a funcionalidade de filtragem e busca sincronizada com ambas as visualizações.

**Non-Goals:**
- Alterar a API de busca de usuários.
- Modificar o `NewMemberModal` ou o fluxo de criação de usuários.

## Decisions

- **Detecção de Viewport:** Utilizar o hook `isMobile` já implementado no `AdminPanel.tsx`.
- **Componentização:** Implementar a visualização mobile como um mapeamento de cards dentro de um `Box` (Stack), evitando a criação de novos arquivos para manter a coesão do painel administrativo por enquanto.
- **Estrutura do Card:**
    - Cabeçalho: Avatar + Nome + Botão de Opções (MoreVertical).
    - Corpo: Detalhes alinhados verticalmente (Email, Cargo/Roles com Chips, Status).
- **Estilo:** Utilizar `Paper` com `border: '1px solid rgba(255, 255, 255, 0.05)'` e `borderRadius: '16px'` para cada card individual no mobile.

## Risks / Trade-offs

- [Vertical Spacing] → Cards ocupam mais espaço vertical do que linhas de tabela. *Mitigação:* Usar um espaçamento compacto (`gap: 2`) e garantir que o scroll da página seja fluido.
- [Paridade de Ações] → Garantir que o clique no menu de opções do card abra o mesmo menu que a tabela. *Mitigação:* Passar o objeto `user` correto para `handleMenuOpen`.
