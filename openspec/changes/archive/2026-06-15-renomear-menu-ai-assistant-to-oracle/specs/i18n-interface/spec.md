## ADDED Requirements

### Requirement: Suporte a Múltiplos Idiomas
A interface do usuário SHALL suportar internacionalização usando `react-i18next`, provendo no mínimo suporte para Inglês (en) e Português (pt). Todos os textos visíveis aos usuários na interface MUST ser extraídos dos arquivos de tradução correspondentes. Em particular, a funcionalidade do assistente baseada em IA SHALL ser referenciada pelo nome "Oráculo" em português e "Oracle" em inglês.

#### Scenario: Visualização do Menu do Assistente
- **WHEN** o usuário seleciona o idioma Português.
- **THEN** o menu de navegação e os títulos das páginas SHALL exibir "Oráculo" em vez de "Assistente de IA".
- **WHEN** o usuário seleciona o idioma Inglês.
- **THEN** o menu de navegação e os títulos das páginas SHALL exibir "Oracle" em vez de "AI Assistant".
