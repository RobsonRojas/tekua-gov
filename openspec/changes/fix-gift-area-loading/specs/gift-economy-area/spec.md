## MODIFIED Requirements

### Requirement: Registro e Listagem de Dádivas
O sistema SHALL permitir que usuários cadastrem ofertas não-financeiras (dádivas) e as disponibilizem para a comunidade em uma área dedicada. O sistema DEVE listar as dádivas com o nome e avatar do provedor, e todas as labels e botões da interface DEVEM estar traduzidos em português e inglês.

#### Scenario: Cadastrar Dádiva
- **WHEN** o usuário preenche o formulário de nova dádiva com título e descrição.
- **THEN** o sistema SHALL armazenar a dádiva com status ativo e associar a autoria ao perfil do usuário.

#### Scenario: Explorar Dádivas
- **WHEN** o usuário acessa a página da Área de Dádivas.
- **THEN** o sistema SHALL listar todas as dádivas ativas, exibindo a descrição, nome de quem a está ofertando e seu avatar.

#### Scenario: Listagem com dados do provedor
- **WHEN** o sistema busca as dádivas ativas
- **THEN** o sistema SHALL incluir os dados do perfil do provedor (nome e avatar) na resposta, sem erro de schema

#### Scenario: Interface traduzida
- **WHEN** o usuário visualiza a Área de Dádivas
- **THEN** todos os títulos, botões, labels e placeholders DEVEM estar traduzidos conforme o idioma selecionado (pt ou en)
