## MODIFIED Requirements

### Requirement: Consulta de Documentação Oficial
O sistema SHALL prover aos membros um local centralizado para consultar as regras e registros da associação.

#### Scenario: Acesso via Dashboard
- **WHEN** o usuário autenticado clica em "Acessar" no card de Documentação na Home.
- **THEN** o sistema redireciona para a página `/documentation`.

#### Scenario: Visualização de Documento
- **WHEN** o usuário seleciona um documento da lista que possui um arquivo físico (com `file_path`) e clica em "Visualizar".
- **THEN** o sistema gera uma URL assinada do Supabase Storage e abre o documento no modal de visualização segura integrado no frontend.

#### Scenario: Visualização de Documento de Link Externo
- **WHEN** o usuário seleciona um documento cadastrado como link externo (com `external_url`) e clica em "Visualizar".
- **THEN** o sistema abre o link diretamente em uma nova guia/aba do navegador utilizando `_blank`, com parâmetros de segurança noopener e noreferrer.
