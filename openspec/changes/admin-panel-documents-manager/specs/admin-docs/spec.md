## ADDED Requirements

### Requirement: Registro de Documentos Oficiais
O sistema SHALL permitir que administradores registrem documentos oficiais com metadados para visualização pelos membros.

#### Scenario: Envio de Novo Documento
- **WHEN** um administrador seleciona um arquivo (PDF/Docx), preenche o título e a categoria e clica em "Salvar".
- **THEN** o sistema faz o upload para o Supabase Storage e registra os metadados na tabela de documentos.

#### Scenario: Listagem por Categoria
- **WHEN** o administrador acessa o gerenciador de documentos e seleciona um filtro de categoria.
- **THEN** o sistema exibe apenas os documentos pertencentes àquela categoria (ex: "Atas").

### Requirement: Gestão de Ciclo de Vida
O sistema SHALL permitir que documentos obsoletos ou incorretos sejam removidos ou atualizados.

#### Scenario: Deleção de Documento
- **WHEN** o administrador clica em remover em um documento existente e confirma a ação.
- **THEN** o sistema deleta o arquivo físico do storage e o registro do banco de dados correspondente.

#### Scenario: Permissão de Escrita Restrita
- **WHEN** um usuário não-administrador tenta acessar o endpoint de escrita ou o bucket.
- **THEN** o Supabase RLS deve bloquear a ação e o frontend não deve exibir os controles de edição.
