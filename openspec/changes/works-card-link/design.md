## Context

Atualmente, o Mural de Trabalho (`WorkWall`) exibe uma lista de tarefas, mas não permite que os usuários referenciem uma tarefa específica de forma direta. O compartilhamento é feito manualmente, o que dificulta a colaboração e a validação de tarefas por terceiros.

## Goals / Non-Goals

**Goals:**
- Prover um botão de compartilhamento em cada `ActivityCard`.
- Implementar suporte a parâmetros de URL para identificar uma tarefa específica.
- Prover uma página dedicada (`TaskDetail`) para visualização completa de uma tarefa.
- Garantir que a interface foque visualmente na tarefa ao acessar pelo link (auto-scroll no mural ou abertura da página de detalhes).

**Non-Goals:**
- Implementar métricas de compartilhamento.

## Decisions

- **Esquema de URL**: Manter suporte ao parâmetro de busca `task` no mural (ex: `/mural?task=ID`) para destaque visual, mas preferir a rota direta `/tasks/:id` para compartilhamento de detalhes completos.
- **Página de Detalhes**: Criar o componente `TaskDetail.tsx` que carrega os dados de uma única atividade via ID da URL.
- **Mecanismo de Redirecionamento**: Se o parâmetro `task` estiver presente no mural, o sistema pode optar por abrir um modal de detalhes ou navegar para a página de detalhes, dependendo da preferência de UX.
- **Destaque Visual**: Manter o efeito de borda pulsante no `ActivityCard` para quando o usuário volta dos detalhes para o mural.
- **Cópia para Clipboard**: O botão de compartilhar copiará a URL da página de detalhes (`/tasks/:id`).

## Risks / Trade-offs

- **Tarefa não encontrada** (ex: deletada ou filtrada): Se o ID da URL não estiver nos dados retornados, o sistema deve ignorar o parâmetro silenciosamente ou mostrar um aviso discreto.
- **Performance de Scroll**: Em listas muito longas, o scroll automático pode ser brusco. Mitigação: Usar `behavior: 'smooth'`.
