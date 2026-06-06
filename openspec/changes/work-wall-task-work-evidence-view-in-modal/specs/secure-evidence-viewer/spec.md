## ADDED Requirements

### Requirement: Modal de Visualização Segura
O sistema SHALL exibir as evidências de tarefas dentro de um modal de visualização segura, sobrepondo o conteúdo atual sem redirecionar ou abrir nova aba.

#### Scenario: Abertura do modal de evidência
- **WHEN** o usuário clica em um item de evidência listado em uma tarefa.
- **THEN** o sistema SHALL abrir um modal contendo a pré-visualização do arquivo (imagem, pdf, etc).

### Requirement: Proteção de Dados e Bloqueio de Cópia
O sistema SHALL implementar proteções no visualizador de evidências para impedir download, seleção de texto, e cópia de imagens.

#### Scenario: Bloqueio de download e cópia
- **WHEN** o modal de evidência é exibido.
- **THEN** o sistema SHALL desabilitar atalhos de teclado de salvamento e impressão (ex: Ctrl+S, Ctrl+P).
- **AND** o sistema SHALL desabilitar o menu de contexto (clique direito).
- **AND** o sistema SHALL ocultar controles de download nativos do elemento de visualização (ex: controles nativos de iframe/video/pdf).
- **AND** o sistema SHALL desabilitar seleção de texto via CSS (`user-select: none`).
