## MODIFIED Requirements

### Requirement: Listagem e Download de Anexos
O sistema SHALL exibir uma lista de todos os arquivos anexados a uma tarefa. Ao invés de permitir download direto, as evidências SHALL ser abertas utilizando o visualizador seguro de evidências (Secure Evidence Viewer). O sistema NÃO DEVE exibir opção de download na listagem.

#### Scenario: Visualização de anexos em uma tarefa
- **WHEN** um membro acessa os detalhes de uma tarefa que possui anexos (evidências).
- **THEN** o sistema SHALL exibir o nome e o ícone correspondente ao tipo de arquivo para cada anexo.
- **AND** o sistema SHALL remover qualquer botão ou link de download direto.
- **AND** o sistema SHALL permitir que o usuário clique em um anexo para abri-lo no visualizador seguro de evidências (modal).
