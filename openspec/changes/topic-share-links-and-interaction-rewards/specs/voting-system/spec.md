## ADDED Requirements

### Requirement: Links Compartilháveis de Pauta e Comentário
O sistema SHALL permitir copiar um link direto para uma pauta e para cada comentário ou resposta, abrindo o conteúdo correspondente para membros autenticados.

#### Scenario: Copiar link da pauta
- **WHEN** um membro aciona o botão de link em um item da lista de pautas ou no detalhe da pauta
- **THEN** o sistema copia para a área de transferência o endereço da pauta e confirma a cópia

#### Scenario: Copiar link do comentário
- **WHEN** um membro aciona o botão de link de um comentário ou resposta
- **THEN** o sistema copia o endereço da pauta apontando para aquele comentário e confirma a cópia

#### Scenario: Abrir link de comentário
- **WHEN** um membro autenticado abre o link de um comentário
- **THEN** a pauta é exibida, a página rola até o comentário e o destaca visualmente

#### Scenario: Link aberto sem sessão
- **WHEN** alguém sem sessão abre o link de uma pauta
- **THEN** o sistema exige login e, após autenticar, leva o membro à pauta ou ao comentário indicado

### Requirement: Recompensa em Surreais por Pauta
O sistema SHALL permitir que o administrador defina, na criação e na edição de uma pauta, um valor de recompensa em surreais (zero ou maior, padrão zero) pago por interação.

#### Scenario: Definir recompensa na criação
- **WHEN** o administrador informa um valor de recompensa ao criar a pauta
- **THEN** a pauta é salva com esse valor

#### Scenario: Editar recompensa
- **WHEN** o administrador edita o valor de recompensa de uma pauta
- **THEN** o novo valor vale para interações futuras e recompensas já pagas não mudam

#### Scenario: Valor inválido
- **WHEN** o valor informado é negativo, não numérico ou acima do limite máximo configurado
- **THEN** o sistema rejeita a criação ou edição

#### Scenario: Edição restrita a administradores
- **WHEN** um membro que não é administrador tenta editar uma pauta
- **THEN** o sistema rejeita a requisição

### Requirement: Crédito de Surreais por Interação com a Pauta
O sistema SHALL creditar surreais ao membro que interage com uma pauta aberta, criando o valor a partir da carteira da tesouraria, registrado no livro-razão.

#### Scenario: Recompensa por voto
- **WHEN** um membro vota em pauta aberta com recompensa maior que zero e ainda não foi recompensado por voto nessa pauta
- **THEN** o sistema credita o valor na carteira do membro, debita a tesouraria e registra o lançamento no livro-razão

#### Scenario: Recompensa por comentário ou resposta
- **WHEN** um membro comenta ou responde em pauta aberta com recompensa maior que zero e ainda não foi recompensado por comentário nessa pauta
- **THEN** o sistema credita o valor ao membro e debita a tesouraria

#### Scenario: Uma recompensa por tipo de interação
- **WHEN** um membro já recompensado por um tipo de interação realiza novamente o mesmo tipo na mesma pauta
- **THEN** a interação é registrada normalmente e nenhum novo crédito é gerado

#### Scenario: Atomicidade
- **WHEN** a interação falha (voto ou comentário não é salvo)
- **THEN** nenhum crédito é gerado; e quando o crédito falha, a interação continua salva sem duplicar pagamento em tentativas futuras

#### Scenario: Pauta sem recompensa ou encerrada
- **WHEN** a pauta tem recompensa zero ou está com status `closed`
- **THEN** nenhum crédito é gerado

#### Scenario: Visibilidade para o membro
- **WHEN** uma interação gera crédito
- **THEN** a resposta ao membro informa o valor recebido para que a interface o exiba, e o lançamento aparece no histórico da carteira
