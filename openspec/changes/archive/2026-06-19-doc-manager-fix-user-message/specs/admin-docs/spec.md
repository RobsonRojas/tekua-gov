## ADDED Requirements

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
