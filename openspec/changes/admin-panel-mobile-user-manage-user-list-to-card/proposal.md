## Why

A lista de usuários no Painel Admin utiliza atualmente uma tabela Material UI (`Table`). Embora eficiente em telas grandes, tabelas são de difícil leitura e interação em dispositivos móveis devido à necessidade de rolagem horizontal excessiva. Transformar cada linha da tabela em um card responsivo no mobile melhorará a legibilidade dos dados (nome, email, cargo, status) e facilitará as ações administrativas (menu de opções) em smartphones.

## What Changes

- Introdução de uma visualização baseada em cards para a lista de membros no Painel Admin quando visualizada em dispositivos móveis (`xs`).
- Manutenção da visualização em tabela para Desktop/Tablet (`sm` e acima).
- Cada card mobile deve conter:
    - Avatar e Nome (em destaque).
    - Email (com suporte a quebra de linha ou elipse).
    - Cargo/Roles (usando os chips existentes).
    - Status (indicador visual).
    - Botão de ações (MoreVertical) consistente com a tabela.
- Refatoração da lógica de renderização em `AdminPanel.tsx` para alternar entre `Table` e uma lista de `Card`/`Paper` baseada no breakpoint `isMobile`.

## Capabilities

### New Capabilities
- `admin-user-list-responsive`: Requisitos para a exibição de membros da associação em formato de cards para dispositivos móveis.

### Modified Capabilities
- `admin-user-management`: Atualização da interface de gerenciamento de membros para suportar múltiplos modos de visualização.

## Impact

- `src/pages/AdminPanel.tsx`: Modificação na seção de renderização da aba de Usuários.
- UX: Experiência de gestão de membros otimizada para administradores em dispositivos móveis.
