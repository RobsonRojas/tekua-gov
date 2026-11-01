## ADDED Requirements

### Requirement: Aviso do destino do trabalho registrado
O formulário de registro de trabalho SHALL informar ao membro, antes do envio, que o trabalho registrado vai diretamente para a coluna "Para Validar" do Mural, sem passar pelas colunas "Aberta" e "Em Execução".

#### Scenario: Aviso visível no formulário
- **WHEN** o membro abre o formulário de registro de trabalho
- **THEN** o formulário SHALL exibir um aviso informando que, após o envio e a aprovação, o trabalho vai direto para a coluna "Para Validar"
- **AND** o aviso SHALL estar visível sem exigir nenhuma interação do membro

#### Scenario: Aviso no idioma ativo
- **WHEN** o idioma ativo é português ou inglês
- **THEN** o aviso SHALL ser exibido no idioma ativo, com o nome da coluna igual ao exibido no Mural
