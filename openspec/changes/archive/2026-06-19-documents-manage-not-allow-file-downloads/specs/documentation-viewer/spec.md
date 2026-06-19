## MODIFIED Requirements

### Requirement: Consulta de Documentação Oficial
O sistema SHALL prover aos membros um local centralizado para consultar as regras e registros da associação, sem permitir o download dos arquivos.

#### Scenario: Acesso via Dashboard
- **WHEN** o usuário autenticado clica em "Acessar" no card de Documentação na Home.
- **THEN** o sistema redireciona para a página `/documentation`.

#### Scenario: Visualização de Documento
- **WHEN** o usuário seleciona um documento da lista e clica em "Visualizar".
- **THEN** o sistema gera uma URL assinada do Supabase Storage e abre o documento em um modal de visualização segura integrado no frontend.
- **AND** o visualizador SHALL ocultar recursos e botões de download e impressão.
