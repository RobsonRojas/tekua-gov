## MODIFIED Requirements

### Requirement: Registro de Documentos Oficiais
O sistema SHALL permitir que administradores (qualquer usuário com o papel 'admin' na coluna `role` ou no array `roles` de seu perfil) registrem documentos oficiais de qualquer formato de arquivo de uso comum (textos, planilhas, imagens, etc.) para visualização ou download pelos membros.

#### Scenario: Envio de Novo Documento por Administrador com Multi-Role
- **WHEN** um administrador secundário ou com múltiplos cargos (que possui 'admin' em `roles` mas outro valor em `role`) seleciona um arquivo e preenche o título e a categoria e clica em "Salvar".
- **THEN** o sistema faz o upload para o Supabase Storage e registra os metadados na tabela `documents` sem violações de política RLS.
- **AND** a interface não SHALL restringir a seleção de arquivos na janela de seleção do sistema operacional.

#### Scenario: Permissão de Escrita Restrita
- **WHEN** um usuário não-administrador (que não possui 'admin' nem em `role` nem no array `roles`) tenta acessar o endpoint de escrita, fazer upload no bucket ou inserir registros na tabela `documents`.
- **THEN** o Supabase RLS deve bloquear a ação e o frontend não deve exibir os controles de edição.
