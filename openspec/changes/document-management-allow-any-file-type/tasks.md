## 1. Ajustes no Frontend (Input de Arquivo)

- [x] 1.1 Localizar o componente de upload de documento (ex: `DocumentForm` ou `FileUploader`).
- [x] 1.2 Remover a restrição da propriedade `accept` (ou ajustá-inline para aceitar `*/*` ou listar as extensões permitidas mais amplas como imagem, planilhas, arquivos zip).
- [x] 1.3 Garantir que a UI exiba corretamente o nome do arquivo após a seleção, independentemente da extensão.

## 2. Ajustes no Backend e Storage

- [x] 2.1 Verificar a configuração do Supabase Storage para o bucket onde os documentos são armazenados (ex: `documents` ou `official_docs`).
- [x] 2.2 Garantir que a `INSERT` policy (RLS) do Storage permita o envio de variados MIME types (ou ao menos remover a restrição que forçava apenas application/pdf).
- [x] 2.3 Checar na API/Edge Function se existe validação extra rejeitando extensões desconhecidas e remover/ajustar essa lógica.

## 3. Testes e Validação

- [x] 3.1 Submeter com sucesso uma imagem (`.png`).
- [x] 3.2 Submeter com sucesso uma planilha (`.csv` ou `.xlsx`).
- [x] 3.3 Validar que o download ou preview funcione no painel de listagem de documentos.
