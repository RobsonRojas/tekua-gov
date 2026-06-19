# task-attachments Specification

## Purpose
Define os requisitos para anexar arquivos a tarefas e demandas no Mural de Trabalho, permitindo que especificações técnicas e evidências de conclusão sejam compartilhadas em diversos formatos (PDF, DOCX, Imagens) de forma segura.
## Requirements
### Requirement: Upload de Múltiplos Arquivos
O sistema SHALL permitir que o usuário selecione e faça upload de múltiplos arquivos (imagens, PDFs, documentos) ao criar uma demanda ou ao submeter prova de trabalho.

#### Scenario: Upload bem-sucedido de múltiplos arquivos
- **WHEN** o usuário seleciona três arquivos diferentes e clica em "Enviar".
- **THEN** o sistema SHALL realizar o upload de cada arquivo para o bucket `task-evidence`.
- **THEN** o sistema SHALL registrar o link de cada arquivo associado à atividade.

### Requirement: Listagem e Download de Anexos
O sistema SHALL exibir uma lista de todos os arquivos anexados a uma tarefa. Ao invés de permitir download direto, as evidências SHALL ser abertas utilizando o visualizador seguro de evidências (Secure Evidence Viewer). O sistema NÃO DEVE exibir opção de download na listagem.

#### Scenario: Visualização de anexos em uma tarefa
- **WHEN** um membro acessa os detalhes de uma tarefa que possui anexos (evidências).
- **THEN** o sistema SHALL exibir o nome e o ícone correspondente ao tipo de arquivo para cada anexo.
- **AND** o sistema SHALL remover qualquer botão ou link de download direto.
- **AND** o sistema SHALL permitir que o usuário clique em um anexo para abri-lo no visualizador seguro de evidências (modal).

### Requirement: Segurança de Acesso aos Anexos
O sistema SHALL garantir que apenas usuários autenticados na plataforma possam acessar as URLs públicas dos anexos.

#### Scenario: Bloqueio de acesso não autenticado
- **WHEN** um usuário não autenticado tenta acessar a URL direta de um anexo.
- **THEN** o sistema (Storage RLS) SHALL negar o acesso ao arquivo.

