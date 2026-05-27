## Why

Atualmente, o gerenciador de documentos obriga os administradores a fazerem o upload de um arquivo físico (ex: PDF ou Docx) para o Supabase Storage. Em muitos casos, os documentos oficiais (como atas ou políticas) estão hospedados em ferramentas colaborativas na nuvem (ex: Google Docs, Notion, etc.). Permitir o cadastro de um documento utilizando apenas uma URL/link simplifica a manutenção e garante que os membros sempre acessem a versão mais atualizada sem a necessidade de re-uploads manuais.

## What Changes

- Modificar o formulário de cadastro de documentos para permitir a escolha entre "Upload de Arquivo" e "Adicionar Link Externo".
- Quando for "Link", o campo de upload de arquivo não será obrigatório e um campo de URL será disponibilizado.
- O banco de dados passará a aceitar documentos que não possuem um arquivo físico no Storage, mas sim um link associado.

## Capabilities

### New Capabilities

### Modified Capabilities
- `admin-docs`: Alteração no requisito de registro de documentos para suportar o cadastro via link, dispensando o upload para o Storage quando aplicável.

## Impact

- **Frontend**: Modificação no componente de cadastro de documentos (`DocumentForm` ou similar) para exibir as opções de tipo de conteúdo (Arquivo vs Link) e validação dos campos.
- **Backend/Supabase**: A tabela de documentos (ex: `documents` ou `official_docs`) precisará permitir que a coluna que guarda o caminho do arquivo seja nula (caso já não seja) e possuir um novo campo (ou reutilizar o existente) para armazenar a URL.
