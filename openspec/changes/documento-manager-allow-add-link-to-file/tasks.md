## 1. Modificações no Banco de Dados

- [x] 1.1 Verificar a tabela de documentos (ex: `official_docs` ou `documents`) e garantir que a coluna de URL do arquivo físico suporte `null` caso ainda não suporte.
- [x] 1.2 Adicionar uma nova coluna `external_url` (texto) à tabela, ou garantir que o frontend utilize a mesma coluna de URL diferenciando por tipo se for adequado na arquitetura atual.

## 2. Ajustes no Frontend (Formulário)

- [x] 2.1 Localizar o componente de cadastro de documento (`DocumentForm`).
- [x] 2.2 Adicionar um controle `RadioGroup` com duas opções: "Upload de Arquivo" e "Link Externo".
- [x] 2.3 Exibir o componente de Upload apenas se "Upload de Arquivo" estiver selecionado.
- [x] 2.4 Exibir um Input de URL obrigatório se "Link Externo" estiver selecionado.
- [x] 2.5 Modificar o submit para que: Se "Link" estiver selecionado, ele envie apenas os metadados e o link para a API, ignorando o passo de upload no Supabase Storage.

## 3. Exibição no Gerenciador

- [x] 3.1 Na lista de documentos e na página de visualização, adaptar o botão "Baixar/Visualizar".
- [x] 3.2 Se for um arquivo físico, abrir a URL do Supabase Storage. Se for um link externo, abrir a URL externa em uma nova aba (`target="_blank"`).
