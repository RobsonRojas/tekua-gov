## Why

Documentos cadastrados na plataforma como links externos (Google Drive, formulários ou outros portais) atualmente tentam carregar no componente de visualização integrada segura (DocumentViewerModal). Como esses links não são PDFs ou imagens locais, a interface exibe um erro de formato não suportado ou falha na renderização de forma amigável. Para melhorar a usabilidade e o acesso direto aos conteúdos externos, documentos que possuem links externos devem ser abertos em uma nova guia do navegador em vez de abrir o modal de visualização.

## What Changes

- Modificação no comportamento de clique ao visualizar um documento: se o documento for um link externo (possuir `external_url`), o sistema deve abrir esse link diretamente em uma nova aba do navegador (`_blank`) utilizando medidas de segurança como `noopener,noreferrer`.
- Garantia de que links externos não acionam a abertura do modal de visualização integrada.
- Atualização das especificações e testes afetados por essa mudança de fluxo.

## Capabilities

### New Capabilities

### Modified Capabilities

- `documentation-viewer`: Alterado para que membros e administradores visualizem links externos diretamente em uma nova guia/aba, enquanto arquivos continuam abrindo no visualizador seguro integrado.

## Impact

- **Frontend**: Componentes que renderizam listas de documentos (`DocumentList`) serão atualizados na lógica de visualização (`handleView`) para interceptar links externos e abri-los em nova aba do navegador.
- **Testes**: Testes de comportamento no frontend e de fluxo que validam o comportamento de visualização integrada para links externos.
