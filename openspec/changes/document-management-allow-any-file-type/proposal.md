## Why

O gerenciador de documentos atualmente restringe o tipo de arquivo a PDF/Docx. Em certas situações, administradores ou a comunidade precisam enviar planilhas (XLSX, CSV), imagens (PNG, JPG) ou arquivos de dados (ZIP) relevantes ao contexto governamental ou à atividade, limitando a flexibilidade da ferramenta.

## What Changes

- A funcionalidade de upload no Gerenciador de Documentos será alterada para aceitar e exibir corretamente arquivos de qualquer formato.
- O Frontend não bloqueará seleções de arquivo baseadas no tipo MIME, exceto restrições de segurança padrão.
- O Storage aceitará esses novos formatos no bucket de documentos.

## Capabilities

### New Capabilities

### Modified Capabilities
- `admin-docs`: A flexibilidade de formato de arquivos fará com que o requisito mude para descrever a aceitação universal de arquivos, em vez de restrito a PDF/Docx.

## Impact

- **Frontend**: Remoção da prop `accept` (ou sua ampliação) nos inputs do tipo `file` dentro do `DocumentForm`.
- **Backend/Supabase**: Validação no Edge Function e na política de Storage (RLS) do Supabase para garantir que não hajam restrições incorretas de MIME type (ou adição de permissões para arquivos genéricos de trabalho).
