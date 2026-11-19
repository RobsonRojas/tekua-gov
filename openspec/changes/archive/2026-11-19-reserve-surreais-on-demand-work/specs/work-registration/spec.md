## ADDED Requirements

### Requirement: Saldo do beneficiário para criar demanda ou registrar trabalho
O Mural de Trabalho SHALL permitir criar demanda ou registrar trabalho com beneficiário membro somente se esse beneficiário possuir saldo disponível suficiente para a recompensa, reservando o valor no cadastro. A interface MUST exibir o saldo disponível do beneficiário e desabilitar o envio, com explicação, quando insuficiente.

#### Scenario: Registro de trabalho com beneficiário sem saldo
- **WHEN** um usuário registra trabalho realizado para um membro cujo saldo disponível é menor que o valor informado
- **THEN** o registro é recusado e o formulário informa o saldo disponível do beneficiário

#### Scenario: Demanda criada com beneficiário escolhido
- **WHEN** um membro cria uma demanda indicando outro membro como beneficiário e este possui saldo
- **THEN** o valor é reservado na carteira do beneficiário indicado, não na do criador

#### Scenario: Demanda sem beneficiário informado
- **WHEN** uma demanda é criada sem indicar beneficiário (por exemplo, pelo formulário de tarefa)
- **THEN** o beneficiário é a Vila: o pagamento sai da Tesouraria e nada é reservado

#### Scenario: Membro indica a si mesmo
- **WHEN** um membro cria uma demanda indicando a si mesmo como beneficiário
- **THEN** o valor é reservado na sua própria carteira

### Requirement: Indicar outro membro como beneficiário é restrito
O sistema SHALL permitir que somente administradores e membros do conselho indiquem outro membro como beneficiário ao criar demanda ou registrar trabalho. Os demais usuários MUST poder indicar apenas a si mesmos ou a Vila. A restrição MUST ser aplicada no servidor, independentemente da interface.

#### Scenario: Membro comum indica outro membro
- **WHEN** um membro sem perfil de administrador ou conselho envia uma demanda ou registro com outro membro como beneficiário
- **THEN** o sistema recusa com erro de permissão e não cria atividade nem reserva

#### Scenario: Conselho indica outro membro
- **WHEN** um membro do conselho cria uma demanda indicando outro membro com saldo suficiente
- **THEN** o valor é reservado na carteira do membro indicado

#### Scenario: Interface para membro comum
- **WHEN** um membro comum abre o formulário de demanda ou de registro
- **THEN** a lista de beneficiários membros contém somente ele mesmo
