# Proposal: Fix Kanban Column Clipping on Mobile

## Why
Usuários estão relatando que as colunas do Kanban parecem "cortadas" na visualização mobile. O ajuste anterior fixou a largura das colunas em `280px`, o que em telas muito pequenas (como 320px-375px) faz com que a coluna seguinte apareça parcialmente pela metade (cortada), criando a sensação de layout quebrado em vez de affordance de scroll. 
Além disso, como o scroll-snapping estava desativado ou configurado de forma muito suave, a coluna pode parar no meio do caminho.

## What
- Reverter as larguras estáticas de `280px` para uma abordagem de `vw` em dispositivos móveis (ex: `85vw` ou `90vw`) para que a coluna ocupe a maior parte da tela e ofereça uma visão focada.
- Aplicar `scroll-snap-type: x mandatory` no contêiner e `scroll-snap-align: center` nas colunas. Isso fará com que o scroll horizontal sempre "puxe" a coluna para o centro, evitando o aspecto de coluna cortada no meio da tela.
