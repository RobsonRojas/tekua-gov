# vote-toggle Specification

## Purpose
Permite que um membro desfaça ou troque o voto registrado em uma pauta aberta, clicando novamente no botão de votação.
## Requirements
### Requirement: Remoção de Voto pelo Próprio Votante
O sistema SHALL permitir que um membro autenticado remova seu voto de uma pauta aberta clicando no botão da opção que já votou, tornando o membro apto a votar novamente ou deixar a pauta sem voto.

#### Scenario: Desfazer voto clicando na mesma opção
- **WHEN** um membro já votou em uma pauta e clica no botão da mesma opção votada
- **THEN** o sistema remove o registro de voto desse membro e atualiza os totais de votos na tela

#### Scenario: Trocar voto clicando em outra opção
- **WHEN** um membro já votou em uma pauta e clica no botão de uma opção diferente da que votou
- **THEN** o sistema substitui o voto anterior pelo novo e atualiza os totais de votos na tela

#### Scenario: Botões de voto permanecem ativos após votar
- **WHEN** um membro já votou em uma pauta aberta
- **THEN** os três botões de votação (Sim, Não, Abstenção) permanecem clicáveis e o botão da opção votada é exibido com destaque visual (ex: variante `contained` ou borda destacada)

#### Scenario: Remoção não permitida em pauta fechada
- **WHEN** um membro tenta remover voto em pauta com status `closed`
- **THEN** o sistema rejeita a operação e mantém os botões desabilitados

