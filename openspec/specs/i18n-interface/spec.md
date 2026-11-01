# i18n-interface Specification

## Purpose
Garantir que todos os elementos da interface do usuário sejam devidamente localizados e que o sistema lide graciosamente com falhas na resolução de chaves de tradução.
## Requirements
### Requirement: Layout-Related Translation Resolution
The system SHALL ensure that all translation keys used in the layout (e.g., navigation labels, page titles, deletion modal elements) are properly defined and resolved in all supported languages, preventing raw keys from being visible to the user.

#### Scenario: Unresolved Key Fallback
- **WHEN** a translation key is missing in the current language.
- **THEN** the system SHALL fallback to the default language (PT-BR) or a human-readable label instead of showing the raw dot-notated key.
- **AND** on mobile navigation, labels for "Notifications" SHALL be correctly translated to "Notificações" or "Notifications".

#### Scenario: Deletion Modal Translation Resolution
- **WHEN** the deletion modal for work wall tasks is rendered.
- **THEN** the title, confirm message, justification field label, and delete button label SHALL be translated correctly in the active language (PT or EN).
- **AND** if a translation key is missing, the system SHALL fallback to a human-readable default label instead of the raw dot-notated key.

### Requirement: Suporte a Múltiplos Idiomas
A interface do usuário SHALL suportar internacionalização usando `react-i18next`, provendo no mínimo suporte para Inglês (en) e Português (pt). Todos os textos visíveis aos usuários na interface MUST ser extraídos dos arquivos de tradução correspondentes. Em particular, a funcionalidade do assistente baseada em IA SHALL ser referenciada pelo nome "Oráculo" em português e "Oracle" em inglês.

#### Scenario: Visualização do Menu do Assistente
- **WHEN** o usuário seleciona o idioma Português.
- **THEN** o menu de navegação e os títulos das páginas SHALL exibir "Oráculo" em vez de "Assistente de IA".
- **WHEN** o usuário seleciona o idioma Inglês.
- **THEN** o menu de navegação e os títulos das páginas SHALL exibir "Oracle" em vez de "AI Assistant".

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
