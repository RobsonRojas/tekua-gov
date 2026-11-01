## ADDED Requirements

### Requirement: Rótulo de autor desconhecido no histórico de ações traduzido
Quando uma ação do histórico de uma demanda não tem nome de autor, o sistema SHALL exibir um rótulo genérico traduzido no idioma ativo, nunca o nome interno da chave de tradução.

#### Scenario: Idioma português
- **WHEN** o idioma ativo é português e a confirmação não tem nome de perfil
- **THEN** o histórico SHALL exibir "Membro da Comunidade"

#### Scenario: Idioma inglês
- **WHEN** o idioma ativo é inglês e a confirmação não tem nome de perfil
- **THEN** o histórico SHALL exibir "Community Member"

#### Scenario: Chave ausente em um idioma
- **WHEN** a tradução do rótulo não existe no idioma ativo
- **THEN** o histórico SHALL exibir "Membro da Comunidade" e NÃO o nome da chave
