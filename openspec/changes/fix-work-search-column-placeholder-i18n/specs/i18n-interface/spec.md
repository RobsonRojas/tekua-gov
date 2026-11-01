## ADDED Requirements

### Requirement: Placeholder de busca das colunas do mural traduzido
O campo de busca de cada coluna do mural de trabalho SHALL exibir um placeholder traduzido no idioma ativo, nunca o nome interno da chave de tradução.

#### Scenario: Idioma português
- **WHEN** o idioma ativo é português e o mural é exibido
- **THEN** o campo de busca de cada coluna SHALL exibir "Pesquisar..."

#### Scenario: Idioma inglês
- **WHEN** o idioma ativo é inglês e o mural é exibido
- **THEN** o campo de busca de cada coluna SHALL exibir "Search..."

#### Scenario: Chave ausente em um idioma
- **WHEN** a tradução do placeholder não existe no idioma ativo
- **THEN** o campo SHALL exibir o texto padrão "Pesquisar..." e NÃO o nome da chave
