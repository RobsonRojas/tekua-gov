# vote-toggle Specification

## Purpose
Permite que um membro desfaça ou troque o voto registrado em uma pauta aberta, clicando novamente no botão de votação.
## Requirements
### Requirement: Remoção de Voto pelo Próprio Votante
O sistema SHALL permitir que um membro autenticado remova seu voto de uma pauta aberta clicando no botão da opção que já votou, tornando o membro apto a votar novamente ou deixar a pauta sem voto. Além disso, o sistema SHALL permitir que o membro registre seu voto inicial ou altere seu voto existente para outra opção (Sim, Não, Abstenção) através de upsert idempotente, sem que ocorram falhas de chave duplicada ou violação da restrição de unicidade (`topic_votes_topic_id_user_id_key`).

#### Scenario: Desfazer voto clicando na mesma opção
- **WHEN** um membro já votou em uma pauta e clica no botão da mesma opção votada
- **THEN** o sistema remove o registro de voto desse membro e atualiza os totais de votos na tela

#### Scenario: Trocar voto clicando em outra opção
- **WHEN** um membro já votou em uma pauta e clica no botão de uma opção diferente da que votou
- **THEN** o sistema substitui o voto anterior pelo novo através de upsert/update sem lançar erro de restrição única (HTTP 400) e atualiza os totais de votos na tela

#### Scenario: Registrar voto inicial com sucesso
- **WHEN** um membro ainda não votou na pauta aberta e clica em qualquer uma das opções (Sim, Não, Abstenção)
- **THEN** o sistema persiste o voto com sucesso sem erro 400 e atualiza a interface exibindo a opção selecionada com destaque

#### Scenario: Botões de voto permanecem ativos após votar
- **WHEN** um membro já votou em uma pauta aberta
- **THEN** os três botões de votação (Sim, Não, Abstenção) permanecem clicáveis e o botão da opção votada é exibido com destaque visual (ex: variante `contained` ou borda destacada)

#### Scenario: Remoção não permitida em pauta fechada
- **WHEN** um membro tenta remover voto em pauta com status `closed`
- **THEN** o sistema rejeita a operação e mantém os botões desabilitados

