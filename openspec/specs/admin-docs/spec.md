# admin-docs Specification

## Purpose
TBD - created by archiving change admin-panel-documents-manager. Update Purpose after archive.
## Requirements
### Requirement: Registro de Documentos Oficiais
O sistema SHALL permitir que administradores registrem documentos oficiais em formatos seguros (PDF ou imagens) para visualização segura pelos membros.

#### Scenario: Envio de Novo Documento
- **WHEN** um administrador seleciona um arquivo PDF ou imagem (PNG, JPG, JPEG, GIF, SVG), preenche o título e a categoria e clica em "Salvar".
- **THEN** o sistema faz o upload para o Supabase Storage e registra os metadados na tabela de documentos.
- **AND** a interface SHALL restringir a seleção de arquivos para PDF e imagens.

### Requirement: Gestão de Ciclo de Vida
O sistema SHALL permitir que documentos obsoletos ou incorretos sejam removidos ou atualizados.

#### Scenario: Deleção de Documento
- **WHEN** o administrador clica em remover em um documento existente e confirma a ação.
- **THEN** o sistema deleta o arquivo físico do storage e o registro do banco de dados correspondente.

#### Scenario: Permissão de Escrita Restrita
- **WHEN** um usuário não-administrador tenta acessar o endpoint de escrita ou o bucket.
- **THEN** o Supabase RLS deve bloquear a ação e o frontend não deve exibir os controles de edição.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.

### Requirement: Tratamento de Erros e Localização no Gerenciador de Documentos
O sistema SHALL mapear e traduzir erros técnicos ocorridos no gerenciamento de documentos (como erros do Supabase Storage ou da API) para chaves de tradução localizadas na língua ativa do usuário, ocultando mensagens internas brutas ou violações de banco de dados/RLS do usuário final.

#### Scenario: Limite de tamanho de arquivo excedido
- **WHEN** o administrador tenta realizar o upload de um documento com tamanho superior ao limite permitido (20MB)
- **THEN** o sistema SHALL exibir a mensagem de erro traduzida "O arquivo excede o limite de tamanho permitido (20MB)." (ou equivalente em inglês) em vez do erro cru "The object exceeded the maximum allowed size".

#### Scenario: Tentativa de upload sem permissão (RLS)
- **WHEN** uma tentativa de upload viola a política de segurança RLS (permissão negada)
- **THEN** o sistema SHALL exibir a mensagem amigável de permissão negada "Acesso negado. Você não tem permissão para gerenciar documentos." (ou equivalente em inglês) em vez de exibir o erro interno de RLS do PostgreSQL.

#### Scenario: Outros erros genéricos do Storage ou API
- **WHEN** ocorre qualquer outro erro de sistema ou falha na rede ao salvar/excluir o documento
- **THEN** o sistema SHALL ocultar o erro técnico interno e exibir "Falha ao enviar o documento. Por favor, tente novamente." para upload ou "Falha ao excluir o documento." para exclusão.

