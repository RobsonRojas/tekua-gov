## ADDED Requirements

### Requirement: Bloco de convite externo traduzido e contido no card
O bloco de convite externo exibido ao criador de uma tarefa aberta SHALL usar textos traduzidos no idioma ativo e SHALL manter todo o seu conteúdo dentro da largura do card, sem cortar texto nem empurrar controles para fora.

#### Scenario: Título e instrução traduzidos
- **WHEN** o criador abre a própria tarefa aberta que possui convite
- **THEN** o bloco SHALL exibir o título e a frase de instrução no idioma ativo
- **AND** o bloco SHALL NOT exibir o nome interno de uma chave de tradução

#### Scenario: Link longo cabe no card
- **WHEN** o link do convite é mais largo que o espaço disponível
- **THEN** o link SHALL quebrar em mais de uma linha dentro do card
- **AND** o botão "Copiar" SHALL permanecer visível e utilizável

#### Scenario: Instrução completa visível
- **WHEN** o bloco é exibido em tela estreita ou larga
- **THEN** a frase de instrução SHALL ser exibida por inteiro, quebrando em linhas quando necessário
