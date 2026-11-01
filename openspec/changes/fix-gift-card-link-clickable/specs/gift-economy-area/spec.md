## ADDED Requirements

### Requirement: Links da descrição clicáveis no card da lista
Os links presentes na descrição de uma dádiva SHALL ser exibidos de forma clicável dentro da largura do card da lista, sem texto cortado, e SHALL abrir em outra aba sem acionar a abertura do modal de detalhes.

#### Scenario: URL solta exibida como link
- **WHEN** a descrição contém uma URL `http` ou `https` solta, como um link de grupo do WhatsApp
- **THEN** o card SHALL exibir um link clicável com o nome do site
- **AND** o texto SHALL permanecer dentro da largura do card

#### Scenario: Clique no link não abre o modal
- **WHEN** o membro clica no link dentro do card
- **THEN** o link SHALL abrir em outra aba, sem acesso à página de origem
- **AND** o modal de detalhes da dádiva SHALL NOT ser aberto

#### Scenario: Clique fora do link abre o modal
- **WHEN** o membro clica em qualquer outra área do card
- **THEN** o modal de detalhes da dádiva SHALL ser aberto
