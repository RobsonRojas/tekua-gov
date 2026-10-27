## Purpose

Oferecer um dashboard público com as gratidões registradas pela comunidade sobre as dádivas, com controle de privacidade por registro pelo autor, e manter as ingratidões sempre privadas por enquanto.

## ADDED Requirements

### Requirement: Dashboard Público de Gratidões
O sistema SHALL oferecer um dashboard público que lista as gratidões registradas sobre dádivas, exibindo a mensagem, os emojis, o nome de quem agradeceu, o nome do provedor da dádiva e a data, para qualquer visitante.

#### Scenario: Visitante consulta o dashboard
- **WHEN** qualquer pessoa acessa o dashboard público de gratidões
- **THEN** o sistema SHALL listar as gratidões públicas, da mais recente para a mais antiga

#### Scenario: Dashboard sem gratidões
- **WHEN** não existe nenhuma gratidão pública
- **THEN** o sistema SHALL exibir uma mensagem informativa, sem erro

### Requirement: Privacidade por Registro
O autor de uma gratidão SHALL poder marcá-la como privada ou pública a qualquer momento. Gratidões privadas SHALL NOT aparecer no dashboard público. Gratidões públicas são o padrão.

#### Scenario: Tornar gratidão privada
- **WHEN** o autor marca uma gratidão como privada
- **THEN** o sistema SHALL removê-la do dashboard público imediatamente

#### Scenario: Tornar gratidão pública novamente
- **WHEN** o autor marca uma gratidão privada como pública
- **THEN** o sistema SHALL exibi-la novamente no dashboard público

#### Scenario: Gratidão privada visível somente ao autor
- **WHEN** o autor consulta suas gratidões
- **THEN** o sistema SHALL exibir também as gratidões privadas, marcadas como privadas

#### Scenario: Outro membro tenta alterar a privacidade
- **WHEN** um membro tenta alterar a visibilidade de uma gratidão de outra pessoa
- **THEN** o sistema SHALL recusar a alteração

### Requirement: Ingratidões Sempre Privadas
O sistema SHALL tratar registros marcados como ingratidão como privados. Ingratidões SHALL NOT aparecer no dashboard público nem no mural, e SHALL ser visíveis somente ao autor. Esta regra vale por enquanto e SHALL ser revista em uma mudança futura.

#### Scenario: Registro de ingratidão
- **WHEN** o membro registra o uso de uma dádiva marcando o sentimento como ingratidão
- **THEN** o sistema SHALL armazenar o registro como privado, independentemente da escolha de visibilidade

#### Scenario: Tentativa de tornar ingratidão pública
- **WHEN** o autor tenta tornar pública uma ingratidão
- **THEN** o sistema SHALL manter o registro privado e informar que ingratidões permanecem privadas por enquanto

#### Scenario: Ingratidão fora do dashboard
- **WHEN** qualquer visitante consulta o dashboard público ou o mural
- **THEN** o sistema SHALL NOT exibir nenhuma ingratidão
