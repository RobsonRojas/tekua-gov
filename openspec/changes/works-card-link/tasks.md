## 1. UI Components

- [ ] 1.1 Adicionar ícone de compartilhamento ao `ActivityCard.tsx`
- [ ] 1.2 Implementar função `handleShare` no `ActivityCard.tsx` para copiar a URL para o clipboard
- [ ] 1.3 Adicionar prop `highlighted` ao `ActivityCard.tsx` e aplicar estilos CSS (borda pulsante/glow)
- [ ] 1.4 Adicionar feedback visual (toast/snackbar) ao copiar o link com sucesso

## 2. Routing and Logic

- [ ] 2.1 Extrair parâmetro `task` da URL no componente `WorkWall.tsx` usando `useSearchParams`
- [ ] 2.2 Implementar lógica de scroll automático e destaque no `WorkWall.tsx` usando `useEffect`
- [ ] 2.3 Garantir que o destaque funcione corretamente após o carregamento assíncrono das tarefas
- [ ] 2.4 Testar o comportamento quando a tarefa não existe ou está em uma aba diferente (filtro)

## 3. Verification

- [ ] 3.1 Verificar manualmente se o link copiado contém o ID correto da tarefa
- [ ] 3.2 Verificar se ao abrir o link em uma nova aba, a tarefa é destacada e a página faz o scroll
- [ ] 3.3 Validar comportamento responsivo (mobile) do botão de compartilhar e scroll
