## ADDED Requirements

### Requirement: Registro e Listagem de Dádivas
O sistema SHALL permitir que usuários cadastrem ofertas não-financeiras (dádivas) e as disponibilizem para a comunidade em uma área dedicada.

#### Scenario: Cadastrar Dádiva
- **WHEN** o usuário preenche o formulário de nova dádiva com título e descrição.
- **THEN** o sistema SHALL armazenar a dádiva com status ativo e associar a autoria ao perfil do usuário.

#### Scenario: Explorar Dádivas
- **WHEN** o usuário acessa a página da Área de Dádivas.
- **THEN** o sistema SHALL listar todas as dádivas ativas, exibindo a descrição e quem a está ofertando.
