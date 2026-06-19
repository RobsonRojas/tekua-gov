## MODIFIED Requirements

### Requirement: Consulta de Documentação Oficial
O sistema SHALL prover aos membros um local centralizado para consultar as regras e registros da associação. A visualização do documento SHALL possuir proteções contra cópia e seleção de texto.

#### Scenario: Visualização de Documento Protegido
- **WHEN** o usuário visualiza um documento no modal (seja PDF ou imagem).
- **THEN** o sistema SHALL impedir a seleção de texto e a cópia do conteúdo (ex: bloqueando `Ctrl+C`).
- **AND** o sistema SHALL manter a capacidade de navegar ou rolar o documento normalmente.
