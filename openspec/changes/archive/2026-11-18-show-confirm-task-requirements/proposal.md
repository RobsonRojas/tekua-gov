## Why

Na tela de detalhe de uma tarefa ou demanda, o botão **Confirmar Tarefa** aparece desabilitado sem nenhuma explicação. O usuário não sabe se falta algo a ser feito, se ele não pode confirmar ou se já confirmou. Isso gera dúvida e chamados de suporte.

## What Changes

- Quando o botão **Confirmar Tarefa** estiver desabilitado, a tela passa a exibir logo abaixo dele uma lista de requisitos para confirmar, marcando quais estão satisfeitos e quais não.
- Cada requisito usa linguagem simples, voltada a quem não conhece as regras internas (ex.: "Você participou desta tarefa como executor; outra pessoa precisa confirmar").
- Os requisitos pendentes ficam em destaque; os satisfeitos aparecem discretos, com ícone de check.
- Quando o botão está habilitado, a lista não é exibida.
- Os textos são internacionalizados (pt e en).
- Sem mudança nas regras de quem pode confirmar; só se torna visível o motivo do bloqueio.

## Capabilities

### New Capabilities

### Modified Capabilities
- `community-validation`: novo requisito de que o botão de confirmação desabilitado deve vir acompanhado da lista de requisitos e do estado de cada um.

## Impact

- **Frontend**: `src/pages/TaskDetail.tsx` (cálculo dos requisitos e renderização da lista), possivelmente um componente pequeno novo para a lista; `src/locales/pt/translation.json` e `src/locales/en/translation.json`.
- Afeta tarefas e demandas, pois usam a mesma tela.
- **Sem impacto em**: banco de dados, RPCs, pagamentos e regras de validação.
