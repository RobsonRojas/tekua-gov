## Context

Atualmente o sistema de documentos oficiais requer o upload físico de um arquivo PDF ou Docx. A comunidade precisa linkar documentos externos (como diretrizes no Google Docs) diretamente no mural de documentos, sem precisar criar PDFs temporários que rapidamente ficam desatualizados.

## Goals / Non-Goals

**Goals:**
- Permitir que os usuários escolham entre duas opções ao adicionar um documento: "Upload de Arquivo" ou "Link Externo".
- Se "Link Externo" for selecionado, salvar a URL fornecida e pular o upload para o Storage.
- Na visualização do documento, ao clicar no botão "Abrir/Baixar", redirecionar para a URL fornecida caso o documento seja do tipo link.

**Non-Goals:**
- Não iremos integrar APIs de terceiros (como Google Drive API) para importar conteúdo de volta ao sistema. É apenas um redirecionamento simples.

## Decisions

- **UI do Formulário**: O componente de criação de documentos (ex: `DocumentForm`) terá um novo campo de seleção (Radio Button ou Select) para "Tipo de Documento: Arquivo ou Link". A exibição dos campos de arquivo ou URL alternará de acordo com essa escolha.
- **Armazenamento**: O Supabase aceitará um valor na coluna `file_url` ou criaremos uma nova coluna `external_link`. O campo que armazena a referência física do Storage passará a ser opcional/nullable.

## Risks / Trade-offs

- **Risk**: Links externos podem quebrar com o tempo (Link Rot).
- **Mitigation**: Isso será um risco aceito gerido pelos administradores, que poderão atualizar o link através das funcionalidades de edição padrão se necessário.
