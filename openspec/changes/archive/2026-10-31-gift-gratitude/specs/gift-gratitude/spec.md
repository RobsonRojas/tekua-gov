## Purpose

Permitir que quem utiliza uma dádiva deixe um agradecimento público opcional (mensagem e emojis), e lembrar, por email e notificação, quem ainda não agradeceu, para incentivar a gratidão na comunidade.

## ADDED Requirements

### Requirement: Agradecimento Opcional ao Registrar Uso de Dádiva
Ao clicar em "Eu utilizei isso", o sistema SHALL apresentar um campo opcional para o membro deixar uma mensagem de agradecimento, emojis, ou ambos. O registro de uso SHALL ser concluído mesmo quando o campo estiver vazio.

#### Scenario: Uso registrado com mensagem
- **WHEN** o membro clica em "Eu utilizei isso" e preenche uma mensagem de agradecimento
- **THEN** o sistema SHALL registrar o uso com a mensagem e incrementar os Pontos de Dádiva do provedor

#### Scenario: Uso registrado somente com emojis
- **WHEN** o membro seleciona um ou mais emojis e não escreve mensagem
- **THEN** o sistema SHALL registrar o uso com os emojis escolhidos

#### Scenario: Uso registrado sem agradecimento
- **WHEN** o membro clica em "Eu utilizei isso" e deixa o campo vazio
- **THEN** o sistema SHALL registrar o uso normalmente, sem agradecimento

#### Scenario: Mensagem acima do limite
- **WHEN** o membro tenta enviar uma mensagem com mais caracteres do que o limite definido
- **THEN** o sistema SHALL recusar a mensagem, informar o limite ao membro e SHALL NOT registrar o uso

### Requirement: Mensagem Fora do Mural
O sistema SHALL NOT exibir o texto do agradecimento nos cards da Área de Dádivas (mural). O agradecimento SHALL ser exibido apenas no dashboard público de gratidões, conforme a spec `gratitude-dashboard`.

#### Scenario: Card do mural sem mensagem
- **WHEN** uma dádiva que recebeu agradecimentos é listada na Área de Dádivas
- **THEN** o card SHALL exibir apenas as informações da oferta, sem o texto dos agradecimentos

### Requirement: Edição Posterior do Agradecimento
O sistema SHALL permitir que o membro adicione ou edite o agradecimento de um uso de dádiva que ele registrou, a qualquer momento, pelo histórico das próprias dádivas utilizadas.

#### Scenario: Adicionar agradecimento depois do uso
- **WHEN** o membro abre o histórico de dádivas que utilizou e escolhe deixar um agradecimento em um uso sem mensagem
- **THEN** o sistema SHALL salvar o agradecimento associado a esse uso

#### Scenario: Editar agradecimento já deixado
- **WHEN** o membro edita o agradecimento de um uso que ele registrou
- **THEN** o sistema SHALL atualizar o texto e os emojis desse uso

#### Scenario: Membro tenta editar uso de outra pessoa
- **WHEN** um membro tenta alterar o agradecimento de um uso registrado por outra pessoa
- **THEN** o sistema SHALL recusar a alteração

### Requirement: Lembrete Semanal de Agradecimento
O sistema SHALL, uma vez por semana, enviar a cada membro que utilizou dádivas nos últimos 7 dias e ainda não deixou agradecimento nesses usos, um email e uma notificação com o texto "Você recebeu alguma dádiva essa semana? Gostaria de deixar um agradecimento para apoiar a alma caridosa.", com link para o histórico de dádivas utilizadas.

#### Scenario: Lembrete enviado a quem não agradeceu
- **WHEN** o ciclo semanal é executado
- **AND** o membro tem ao menos um uso dos últimos 7 dias sem agradecimento
- **THEN** o sistema SHALL enviar um email e uma notificação in-app para o membro, com o link para deixar o agradecimento

#### Scenario: Sem lembrete quando já agradeceu
- **WHEN** o ciclo semanal é executado
- **AND** todos os usos dos últimos 7 dias do membro já têm agradecimento
- **THEN** o sistema SHALL NOT enviar o lembrete a esse membro

#### Scenario: Um lembrete por semana
- **WHEN** o ciclo semanal é executado mais de uma vez na mesma semana
- **THEN** o sistema SHALL enviar no máximo um lembrete por membro por semana

#### Scenario: Falha no envio de email
- **WHEN** o envio do email falha
- **THEN** o sistema SHALL manter a notificação in-app e registrar a falha, sem interromper o envio aos demais membros
