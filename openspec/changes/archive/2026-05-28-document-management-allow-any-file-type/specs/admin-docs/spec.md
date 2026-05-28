## MODIFIED Requirements

### Requirement: Registro de Documentos Oficiais
O sistema SHALL permitir que administradores registrem documentos oficiais de qualquer formato de arquivo de uso comum (textos, planilhas, imagens, etc.) para visualização ou download pelos membros.

#### Scenario: Envio de Novo Documento
- **WHEN** um administrador seleciona um arquivo de formato de trabalho ou mídia (ex: PDF, XLSX, PNG, CSV), preenche o título e a categoria e clica em "Salvar".
- **THEN** o sistema faz o upload para o Supabase Storage e registra os metadados na tabela de documentos.
- **AND** a interface não SHALL restringir a seleção de arquivos na janela de seleção do sistema operacional (file picker).
