## Why

Ao clicar em transferir na tela da carteira, o sistema falha com o erro de React/DOM "Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node." Isso impede completamente a usabilidade da funcionalidade de transferência. O problema ocorre devido ao aninhamento incorreto de nós do DOM pelo React (ex: elementos de bloco dentro de títulos ou Fragmentos inválidos dentro de Inputs do Material UI).

## What Changes

- Corrigir o aninhamento HTML inválido no `DialogTitle` do modal de transferência mudando o elemento renderizado do `<Typography>`.
- Substituir o uso de React Fragments (`<>...</>`) nos adornments (`startAdornment` e `endAdornment`) do `TextField` do Autocomplete pelo uso correto de `InputAdornment` do Material UI.
- Remover a propriedade de DOM inválida `scroll-behavior="smooth"` no botão de confirmação.

## Capabilities

### New Capabilities
- Nenhum

### Modified Capabilities
- Nenhum (Apenas correção de implementação no frontend, sem mudanças de requisitos).

## Impact

- Impacta diretamente o arquivo `src/pages/Wallet.tsx`.
- Resolve o crash da tela ao abrir o modal de transferência.
- Nenhum impacto em integrações de backend ou regras de negócios.
