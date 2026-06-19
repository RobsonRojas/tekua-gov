## ADDED Requirements

### Requirement: Conteúdo em HTML Sanitizado
O conteúdo da pauta DEVE ser armazenado como HTML sanitizado no campo JSONB `content`, em vez de Markdown. A exibição DEVE renderizar o HTML com segurança.

#### Scenario: Criação de Pauta Salva como HTML
- **WHEN** um administrador cria uma pauta com o editor de texto rico
- **THEN** o conteúdo é salvo como HTML (ex: `<p>Texto com <strong>negrito</strong></p>`) na chave de idioma correspondente

#### Scenario: Exibição Renderiza HTML
- **WHEN** um membro visualiza uma pauta
- **THEN** o HTML é renderizado com segurança, exibindo a formatação visual sem tags visíveis

#### Scenario: Compatibilidade com Dados Existentes
- **WHEN** uma pauta criada anteriormente (Markdown) é visualizada
- **THEN** o sistema ainda renderiza corretamente o Markdown como texto formatado
