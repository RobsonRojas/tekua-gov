## Context

Atualmente, o Mural de Trabalho (`WorkWall`) exibe uma lista de tarefas, mas não permite que os usuários referenciem uma tarefa específica de forma direta. O compartilhamento é feito manualmente, o que dificulta a colaboração e a validação de tarefas por terceiros.

## Goals / Non-Goals

**Goals:**
- Prover um botão de compartilhamento em cada `ActivityCard`.
- Implementar suporte a parâmetros de URL para identificar uma tarefa específica.
- Garantir que a interface foque visualmente na tarefa ao acessar pelo link (auto-scroll e destaque).

**Non-Goals:**
- Criar uma página dedicada de detalhes para tarefas (o objetivo é manter o contexto do mural).
- Implementar métricas de compartilhamento.

## Decisions

- **Esquema de URL**: Utilizar o parâmetro de busca `task` (ex: `/mural?task=ID`). Isso evita mudanças estruturais nas rotas e permite que o usuário veja a tarefa no contexto do mural completo.
- **Mecanismo de Foco**: No componente `WorkWall`, um `useEffect` monitorará o parâmetro `task`. Quando presente, o sistema aguardará o carregamento dos dados e usará `scrollIntoView` para posicionar a tarefa na tela.
- **Destaque Visual**: Adicionar uma prop `highlighted` ao `ActivityCard` que aplica uma borda pulsante ou um efeito de sombra (glow) para destacar a tarefa alvo.
- **Cópia para Clipboard**: Utilizar a API nativa `navigator.clipboard` para copiar a URL completa (base + path + query).

## Risks / Trade-offs

- **Tarefa não encontrada** (ex: deletada ou filtrada): Se o ID da URL não estiver nos dados retornados, o sistema deve ignorar o parâmetro silenciosamente ou mostrar um aviso discreto.
- **Performance de Scroll**: Em listas muito longas, o scroll automático pode ser brusco. Mitigação: Usar `behavior: 'smooth'`.
