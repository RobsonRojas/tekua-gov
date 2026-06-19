## 1. Components

- [x] 1.1 Criar o componente `EvidenceViewerModal.tsx` baseado nas proteções definidas (remoção de context menu, bloqueios de atalho).
- [x] 1.2 Implementar bloqueios visuais (`user-select: none`, `pointer-events: none` em camadas não interativas) no `EvidenceViewerModal`.
- [x] 1.3 Impedir atalhos de cópia, impressão e salvamento dentro do modal capturando eventos `onKeyDown`.

## 2. Integration

- [x] 2.1 Refatorar os componentes de listagem de evidências no Work Wall para remover links diretos ou botões de download.
- [x] 2.2 Integrar o `EvidenceViewerModal` na visualização da tarefa para exibir a evidência no clique.
- [x] 2.3 Garantir que os tipos de evidência (PDF, Imagens) sejam suportados e renderizados corretamente no novo visualizador sem controles de download nativos.
