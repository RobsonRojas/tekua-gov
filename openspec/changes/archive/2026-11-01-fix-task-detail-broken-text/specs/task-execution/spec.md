## ADDED Requirements

### Requirement: Descrição da tarefa contida na largura do card
A descrição exibida no detalhe da tarefa SHALL permanecer dentro da largura do card, quebrando palavras e URLs longas, e SHALL preservar as quebras de linha digitadas pelo autor.

#### Scenario: URL longa na descrição
- **WHEN** a descrição contém uma URL ou palavra mais longa que a largura do card
- **THEN** o texto SHALL quebrar em mais de uma linha dentro do card
- **AND** a descrição SHALL NOT causar rolagem horizontal nem ser cortada

#### Scenario: Quebras de linha preservadas
- **WHEN** a descrição contém linhas separadas por quebra de linha
- **THEN** o detalhe SHALL exibir as linhas separadas como digitadas
