## MODIFIED Requirements

### Requirement: Registro de Documentos Oficiais
O sistema SHALL permitir que administradores registrem documentos oficiais com metadados para visualização pelos membros, podendo optar por fazer upload de um arquivo físico ou fornecer um link para um documento externo.

#### Scenario: Envio de Novo Documento com Upload
- **WHEN** um administrador seleciona a opção de "Arquivo", escolhe um arquivo local (PDF/Docx), preenche o título e a categoria e clica em "Salvar".
- **THEN** o sistema faz o upload para o Supabase Storage e registra os metadados na tabela de documentos.

#### Scenario: Cadastro de Documento via Link Externo
- **WHEN** um administrador seleciona a opção "Link", informa uma URL válida, preenche título e categoria, e salva.
- **THEN** o sistema SHALL registrar o documento na tabela sem realizar upload para o Storage, armazenando o link fornecido para visualização.
