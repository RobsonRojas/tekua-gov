## Purpose

Garante que demandas e trabalhos tenham lastro: o valor da recompensa é reservado na carteira do beneficiário no cadastro e fica indisponível para outros usos até o pagamento ou a liberação.

## ADDED Requirements

### Requirement: Saldo disponível exigido no cadastro
O sistema SHALL recusar a criação de uma demanda ou o registro de um trabalho cujo beneficiário seja um membro com saldo disponível (saldo total menos saldo reservado) menor que o valor da recompensa. A recusa MUST ocorrer no servidor, independentemente da validação da interface, e MUST NOT criar a atividade.

#### Scenario: Saldo suficiente
- **WHEN** o beneficiário possui saldo disponível de 100 surreais e a demanda tem recompensa de 60
- **THEN** a demanda é criada e 60 surreais são reservados

#### Scenario: Saldo insuficiente
- **WHEN** o beneficiário possui saldo disponível de 40 surreais e a recompensa é 60
- **THEN** o sistema recusa o cadastro com erro de saldo insuficiente informando o saldo disponível
- **AND** nenhuma atividade nem reserva é criada

#### Scenario: Saldo já comprometido por outra reserva
- **WHEN** o beneficiário tem saldo total 100, com 80 já reservados, e tenta cadastrar uma demanda de 30
- **THEN** o sistema recusa o cadastro, pois o saldo disponível é 20

### Requirement: Reserva na carteira do beneficiário
Ao cadastrar a atividade, o sistema SHALL reservar o valor da recompensa na carteira do beneficiário de forma atômica com a criação da atividade. O valor reservado MUST permanecer no saldo total, mas MUST estar indisponível para transferências, novas reservas e ajustes administrativos de débito.

#### Scenario: Valor reservado fica indisponível
- **WHEN** existe uma reserva de 60 na carteira com saldo total 100
- **THEN** o saldo disponível é 40
- **AND** uma transferência de 50 feita por esse membro é recusada

#### Scenario: Cadastros concorrentes
- **WHEN** dois cadastros simultâneos competem pelo mesmo saldo disponível que só cobre um deles
- **THEN** exatamente um é aceito e o outro é recusado por saldo insuficiente

### Requirement: Confirmação transfere da carteira do beneficiário ao executor
Quando a atividade com beneficiário membro for confirmada, o sistema SHALL transferir o valor reservado diretamente da carteira do beneficiário para cada executor, sem passar pela Tesouraria, e marcar a reserva como consumida. A reserva MUST cobrir o valor de cada executor (valor × número de executores).

#### Scenario: Confirmação com um executor
- **WHEN** o solicitante confirma uma atividade com reserva de 60 e um executor
- **THEN** o saldo total do beneficiário e o reservado diminuem 60 e o executor recebe 60 dessa carteira
- **AND** a Tesouraria não é movimentada

#### Scenario: Confirmação com vários executores
- **WHEN** uma atividade de 60 por executor, com dois executores, é confirmada e o beneficiário tem 120 reservados
- **THEN** cada executor recebe 60 da carteira do beneficiário

#### Scenario: Executor adicional sem saldo
- **WHEN** um executor é incluído e o beneficiário não tem saldo disponível para reservar mais um valor
- **THEN** a inclusão é recusada por saldo insuficiente

### Requirement: Liberação da reserva
O sistema SHALL liberar integralmente a reserva quando a atividade for rejeitada ou removida antes do pagamento, devolvendo o valor ao saldo disponível do beneficiário.

#### Scenario: Atividade removida por administrador
- **WHEN** um administrador remove uma atividade com reserva ativa de 60
- **THEN** a reserva é liberada e o saldo disponível do beneficiário aumenta 60

### Requirement: Beneficiário coletivo sem reserva
Quando o beneficiário for a comunidade (Tekuá/aldeia) e não um membro, o sistema SHALL pagar os executores pela Tesouraria e MUST NOT exigir saldo nem criar reserva.

#### Scenario: Demanda para a aldeia
- **WHEN** um membro cria uma demanda com beneficiário "aldeia" e saldo zero
- **THEN** a demanda é criada sem reserva
