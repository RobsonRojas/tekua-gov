## MODIFIED Requirements

### Requirement: Registro de Documentos Oficiais
O sistema SHALL permitir que administradores registrem documentos oficiais em formatos seguros (PDF ou imagens) para visualização segura pelos membros.

#### Scenario: Envio de Novo Documento
- **WHEN** um administrador seleciona um arquivo PDF ou imagem (PNG, JPG, JPEG, GIF, SVG), preenche o título e a categoria e clica em "Salvar".
- **THEN** o sistema faz o upload para o Supabase Storage e registra os metadados na tabela de documentos.
- **AND** a interface SHALL restringir a seleção de arquivos para PDF e imagens.
