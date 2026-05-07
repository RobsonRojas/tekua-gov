## Why

Atualmente, o sistema de tarefas e o mural de trabalho permitem apenas uma única URL de evidência (geralmente uma imagem) no momento da conclusão. No entanto, demandas complexas muitas vezes exigem que o solicitante anexe documentos de referência (PDFs, planilhas, especificações) e que o executor forneça múltiplos arquivos como prova de conclusão. Esta mudança visa aumentar a transparência e a riqueza das informações compartilhadas no Tekuá Gov.

## What Changes

- **Sistema de Anexos**: Implementação de suporte para múltiplos arquivos por tarefa/atividade.
- **Suporte no Cadastro de Demandas**: Permitir que o solicitante anexe arquivos ao criar uma nova demanda (`CreateDemand`).
- **Múltiplas Evidências**: Permitir que o executor anexe diversos arquivos ao registrar trabalho ou submeter a conclusão de uma tarefa (`RegisterWork`, `SubmitTaskProof`).
- **Visualização e Download**: Exibição da lista de anexos no `ActivityCard` e em `TaskDetail`, permitindo que outros membros visualizem e baixem os arquivos.
- **Armazenamento Seguro**: Configuração de políticas de armazenamento para garantir que apenas membros autenticados possam acessar os anexos.

## Capabilities

### New Capabilities
- `task-attachments`: Gerenciamento de múltiplos arquivos anexados a uma atividade, incluindo upload, armazenamento e visualização.

### Modified Capabilities
- `task-execution`: Atualização do requisito de submissão para suportar múltiplos anexos de evidência.
- `evidence-capture`: Expansão da captura de evidências para incluir arquivos genéricos além de fotos.

## Impact

- **Database**: Criação da tabela `activity_attachments` e migração de `activity_evidence` para suportar múltiplos itens se necessário.
- **Storage**: Criação de um novo bucket ou organização do bucket `task-evidence` para suportar tipos de arquivos variados.
- **API**: Atualização dos RPCs `createActivity`, `submitActivity` e `submitProof` para aceitar arrays de anexos.
- **Frontend**: Novos componentes de upload de arquivos e listas de downloads.
