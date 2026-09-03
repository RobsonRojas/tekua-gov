# Spec: Kanban Column Clipping

## Requirements

1. **Fluid Mobile Columns:**
   - Em telas móveis (breakpoint `xs`), a coluna deve usar larguras relativas à viewport (ex. `85vw` ou `90vw`) em vez de larguras fixas em pixels.
   - Isso garante que a coluna atual preencha quase toda a tela, e a próxima coluna fique apenas levemente visível (como dica visual), mas sem poluir o espaço de leitura.

2. **Mandatory Snap:**
   - O scroll deve obrigatoriamente realizar o snap ("encaixe") em uma coluna inteira ao finalizar o swipe. Não deve ser possível parar o scroll entre duas colunas.
   - Isso elimina o aspecto de "interface cortada".
