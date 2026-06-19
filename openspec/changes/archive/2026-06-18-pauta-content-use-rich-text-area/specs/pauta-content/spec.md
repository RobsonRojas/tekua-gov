## ADDED Requirements

### Requirement: Editor de Texto Rico para Pautas
O sistema DEVE fornecer um editor de texto rico (WYSIWYG) para criação e edição do conteúdo de pautas/votações, compatível com React 19. O conteúdo produzido DEVE ser HTML sanitizado armazenado no formato JSONB i18n.

#### Scenario: Criação de Pauta com Rich Text
- **WHEN** um administrador acessa o diálogo de criação de pauta
- **THEN** o sistema exibe um editor WYSIWYG com botões de formatação (negrito, itálico, listas, links, parágrafos, títulos)
- **WHEN** o administrador digita texto formatado e salva
- **THEN** o sistema armazena o conteúdo como HTML sanitizado no campo JSONB `content`, na chave do idioma atual

#### Scenario: Visualização de Conteúdo Formatado
- **WHEN** um membro acessa o detalhe de uma pauta
- **THEN** o sistema exibe o conteúdo formatado (negrito, listas, links, etc.) preservando a formatação original sem exibir tags HTML

### Requirement: Sanitização de Conteúdo HTML
O sistema DEVE sanitizar o HTML produzido pelo editor para prevenir ataques XSS, permitindo apenas tags e atributos seguros.

#### Scenario: Sanitização ao Salvar
- **WHEN** o administrador salva o conteúdo da pauta
- **THEN** o sistema remove tags não autorizadas (script, iframe, object, etc.) e atributos perigosos (onclick, onload, etc.) antes de persistir

### Requirement: Compatibilidade com React 19
O componente do editor DEVE funcionar sem erros ou warnings no strict mode do React 19.

#### Scenario: Renderização sem falhas
- **WHEN** o editor é renderizado em ambiente React 19 strict mode
- **THEN** não ocorre erro de `findDOMNode` ou qualquer outro erro de renderização
