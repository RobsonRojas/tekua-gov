## Why

No histórico de ações de uma demanda, quando o autor da confirmação não tem nome de perfil, a interface exibe o texto cru `work.communityMember`. A chave é usada em `DemandActionHistory.tsx`, mas não existe nos arquivos de tradução. O fallback `|| 'Membro da Comunidade'` nunca age, porque o `t()` do i18next devolve a própria chave quando ela falta.

## What Changes

- Adicionar `work.communityMember` em `src/locales/pt/translation.json` ("Membro da Comunidade") e em `src/locales/en/translation.json` ("Community Member").
- Trocar o fallback inútil em `DemandActionHistory.tsx` por um valor padrão passado ao `t()`.

## Capabilities

### New Capabilities
- (nenhuma)

### Modified Capabilities
- `i18n-interface`: o rótulo de autor desconhecido no histórico de ações é traduzido nos dois idiomas.

## Impact

- `src/locales/pt/translation.json` e `src/locales/en/translation.json`: uma chave nova em cada.
- `src/components/work/DemandActionHistory.tsx`: uma linha.
- Sem mudança de API, banco ou dependências.
