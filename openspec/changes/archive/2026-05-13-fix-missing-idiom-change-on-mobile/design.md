## Context

O `LanguageSelector` no dispositivo móvel está posicionado na base do `MobileDrawer` usando `mt: 'auto'`. Em telas pequenas ou menus com muitos itens, essa seção pode transbordar para baixo da área visível do viewport, impedindo o acesso.

## Goals / Non-Goals

**Goals:**
- Garantir que o seletor de idioma esteja sempre visível no menu mobile.
- Manter o alinhamento visual com os outros itens de utilidade (Logout).

## Decisions

- **Reposicionamento:** Mover o `LanguageSelector` de um `Box` isolado no fundo para uma posição mais alta, preferencialmente acima do botão de Logout ou integrado em uma lista de utilitários que não transborda de forma invisível.
- **Estilo:** Manter o estilo atual do componente `LanguageSelector`, apenas ajustando seu container no `MobileDrawer.tsx`.

## Risks / Trade-offs

- [Layout Spacing] → Mover o seletor para cima pode apertar a lista de navegação. *Mitigação:* Usar um divisor claro e garantir que a lista principal continue sendo `flex-grow`.
