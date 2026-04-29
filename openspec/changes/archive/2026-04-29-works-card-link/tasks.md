## 1. UI Components

- [x] 1.1 Adicionar ícone de compartilhamento ao `ActivityCard.tsx`
- [x] 1.2 Implementar função `handleShare` no `ActivityCard.tsx` para copiar a URL para o clipboard
- [x] 1.3 Adicionar prop `highlighted` ao `ActivityCard.tsx` e aplicar estilos CSS (borda pulsante/glow)
- [x] 1.4 Adicionar feedback visual (toast/snackbar) ao copiar o link com sucesso
- [x] 1.5 Criar o componente de página `TaskDetail.tsx` para exibir informações completas da tarefa
- [x] 1.6 Adicionar link/navegação no `ActivityCard.tsx` para a página de detalhes ao clicar no card

## 2. Routing and Logic

- [x] 2.1 Extrair parâmetro `task` da URL no componente `WorkWall.tsx` usando `useSearchParams`
- [x] 2.2 Implementar lógica de scroll automático e destaque no `WorkWall.tsx` usando `useEffect`
- [x] 2.3 Garantir que o destaque funcione corretamente após o carregamento assíncrono das tarefas
- [x] 2.4 Testar o comportamento quando a tarefa não existe ou está em uma aba diferente (filtro)
- [x] 2.5 Configurar nova rota `/tasks/:id` no `router.tsx` apontando para `TaskDetail`
- [x] 2.6 Implementar carregamento de dados individuais na página `TaskDetail` via RPC ou API

## 3. Verification

- [x] 3.1 Verificar manualmente se o link copiado contém o ID correto da tarefa
- [x] 3.2 Verificar se ao abrir o link em uma nova aba, a tarefa é destacada e a página faz o scroll
- [x] 3.3 Validar comportamento responsivo (mobile) do botão de compartilhar e scroll
- [x] 3.4 Verificar se o link compartilhado agora redireciona corretamente para a página de detalhes
- [x] 3.5 Validar visualização de dados (título, descrição, evidências, confirmações) na página `TaskDetail`
