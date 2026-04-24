## Context

A Associação Tekuá necessita de um local seguro para disponibilizar documentos aos seus membros. Administradores devem ser capazes de gerenciar o ciclo de vida desses documentos (Envio, Edição de Metadados e Remoção).

## Goals / Non-Goals

**Goals:**
- Prover uma interface simples de upload de documentos oficiais (PDF, Docx).
- Organizar documentos por categorias (ex: Atas, Estatuto, Relatórios).
- Armazenar arquivos fisicamente no Supabase Storage.
- Garantir que apenas administradores possam realizar alterações (RLS).

**Non-Goals:**
- Edição colaborativa de documentos (estilo Google Docs).
- Gestão de permissões por documento individual (será binário: Membro lendo, Admin editando).

## Decisions

- **Storage Strategy**: Criar um bucket privado chamado `official-docs` no Supabase.
- **Metadata Storage**: Tabela `documents` contendo o caminho do arquivo no bucket, `category`, e metadados como `title` e `description` em formato **JSONB** (i18n).
- **UI Architecture**: Inserir uma nova seção no `AdminPanel.tsx`. No frontend, acesso via rota `/admin/documents`.
- **Mutations (Edge Functions)**:
    - `document_upload_handler`: Para registrar metadados e validar permissões pós-upload no Storage.
    - `document_metadata_update`: Para editar títulos/descrições multilíngues.
- **Categorization**: Usar uma lista pré-definida de categorias para consistência (Estatuto, Atas, Financeiro, Outros). Categorias também suportam tradução via objeto JSON centralizado ou no banco.

## Risks / Trade-offs

- **Storage Limits**: Monitorar o uso do bucket gratuito do Supabase (limites de tamanho total).
- **Public access**: Embora o bucket seja privado, o backend poderá gerar URLs assinadas (signed URLs) temporárias para visualização pelos membros.
