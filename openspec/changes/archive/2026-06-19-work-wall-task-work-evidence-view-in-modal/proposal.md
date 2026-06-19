## Why

Atualmente as evidências de tarefas no work-wall podem ser visualizadas de forma que o download seja permitido, o que pode comprometer a segurança e a privacidade dos dados. Precisamos garantir que as evidências sejam visualizadas em um modal seguro (semelhante ao de documentos) que bloqueie downloads, seleções e cópias, protegendo assim a integridade e privacidade das informações submetidas.

## What Changes

- Visualização de evidências passará a ocorrer dentro de um modal seguro, em vez de abrir diretamente em uma nova aba ou permitir download direto.
- Bloqueio de download de evidências na visualização do modal.
- Bloqueio de seleção de texto/dados e de cópia na visualização de evidências.
- Remoção ou desabilitação de opções de download nos itens de evidência listados nas tarefas.

## Capabilities

### New Capabilities
- `secure-evidence-viewer`: Visualizador de evidências de tarefas focado em segurança, com bloqueio de download, seleção e cópia.

### Modified Capabilities
- `task-attachments`: Modificação nos requisitos de exibição de anexos/evidências para utilizar o `secure-evidence-viewer` ao invés de downloads ou visualização desprotegida.

## Impact

- Componente de exibição de tarefas e evidências no front-end do work-wall.
- Integração ou reaproveitamento do visualizador de documentos existente (`DocumentViewerModal`) para suportar ou inspirar o `EvidenceViewerModal`.
- Componentes e hooks relacionados ao acesso de arquivos de evidência.
