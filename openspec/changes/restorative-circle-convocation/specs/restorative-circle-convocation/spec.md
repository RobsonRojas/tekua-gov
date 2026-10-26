## Purpose

Permitir que um membro convoque um círculo restaurativo ao final do wizard de justiça restaurativa, avisando a vila por email e notificação, divulgando a convocação no dashboard e no painel do administrador, sem expor as partes envolvidas no conflito.

## ADDED Requirements

### Requirement: Formulário de Convocação ao Final do Wizard
Ao acionar a ação final do Passo 4 (Câmara Coletiva) do wizard, o sistema SHALL exibir o formulário de convocação do círculo restaurativo, no lugar de apenas orientar o usuário a procurar a Equipe de Harmonia.

#### Scenario: Abrir o formulário pelo Passo 4
- **WHEN** o membro aciona a ação final do Passo 4 do wizard
- **THEN** o sistema SHALL exibir o formulário de convocação com os campos tema, descrição, data e horário, local ou link, e a confirmação de que os pré-círculos individuais foram considerados

#### Scenario: Campos obrigatórios ausentes
- **WHEN** o membro tenta enviar o formulário sem tema, data e horário, ou sem a confirmação dos pré-círculos
- **THEN** o sistema SHALL informar os campos faltantes e SHALL NOT criar a convocação

#### Scenario: Data no passado
- **WHEN** o membro informa uma data e horário anteriores ao momento atual
- **THEN** o sistema SHALL recusar a data e SHALL NOT criar a convocação

### Requirement: Privacidade das Partes na Convocação
A convocação SHALL NOT conter nem exigir nomes das partes envolvidas no conflito. O conteúdo visível a todos os membros SHALL limitar-se ao tema, à descrição geral, à data, ao horário e ao local ou link informados.

#### Scenario: Texto genérico de tema
- **WHEN** o membro preenche o tema e a descrição da convocação
- **THEN** o sistema SHALL exibir a convocação a todos os membros sem nenhum campo que identifique as partes

#### Scenario: Descrição com endereço de email
- **WHEN** o tema ou a descrição informados contêm um endereço de email
- **THEN** o sistema SHALL alertar o membro, em destaque antes da confirmação, de que a convocação é visível a toda a vila
- **AND** SHALL NOT criar a convocação enquanto o endereço não for removido, tanto no formulário quanto no backend

### Requirement: Link de Compartilhamento da Convocação
Ao criar a convocação, o sistema SHALL gerar um link de compartilhamento único (`/share/circle/<token>`), em que o token SHALL ser não adivinhável e SHALL NOT repetir entre convocações.

#### Scenario: Link gerado na criação
- **WHEN** a convocação é criada com sucesso
- **THEN** o sistema SHALL exibir o link de compartilhamento com a opção de copiá-lo

#### Scenario: Acesso pelo link
- **WHEN** um membro autenticado acessa o link de compartilhamento
- **THEN** o sistema SHALL exibir os detalhes da convocação e o status atual

#### Scenario: Acesso sem sessão
- **WHEN** uma pessoa sem sessão acessa o link de compartilhamento
- **THEN** o sistema SHALL solicitar o login antes de exibir qualquer detalhe

#### Scenario: Token inválido ou inexistente
- **WHEN** alguém acessa um link com token que não corresponde a nenhuma convocação
- **THEN** o sistema SHALL informar que a convocação não foi encontrada, sem revelar outras convocações

### Requirement: Convite por Email e Notificação à Vila
Ao criar uma convocação, o sistema SHALL enviar a todos os membros da vila um email e uma notificação in-app com push para o PWA, convidando-os ao círculo e levando ao link de compartilhamento.

#### Scenario: Convite enviado à vila
- **WHEN** uma convocação é criada
- **THEN** o sistema SHALL enviar o email e a notificação para cada membro da vila, com o tema, a data e horário e o link

#### Scenario: Notificação push no PWA
- **WHEN** um membro tem o PWA instalado e push habilitado
- **THEN** o sistema SHALL exibir uma notificação do sistema que, ao ser tocada, abre o link de compartilhamento

#### Scenario: Falha no envio para um membro
- **WHEN** o envio falha para um membro específico
- **THEN** o sistema SHALL manter a convocação e SHALL continuar o envio aos demais membros

### Requirement: Destaque no Dashboard
O sistema SHALL exibir em destaque no dashboard (Home) a convocação de círculo restaurativo que esteja aberta e com data futura, para todos os membros autenticados.

#### Scenario: Convocação ativa no dashboard
- **WHEN** existe uma convocação aberta com data futura
- **THEN** o dashboard SHALL exibir um destaque com o tema, a data e horário e o link para a convocação, para todos os membros

#### Scenario: Sem convocação ativa
- **WHEN** não existe convocação aberta com data futura
- **THEN** o dashboard SHALL NOT exibir o destaque

#### Scenario: Convocação encerrada
- **WHEN** a convocação é encerrada ou cancelada
- **THEN** o destaque SHALL deixar de aparecer no dashboard

### Requirement: Gestão no Painel do Administrador
O sistema SHALL exibir no painel do administrador a lista de todas as convocações de círculo restaurativo, com status, data de criação, autor e data agendada, e SHALL permitir ao administrador encerrar ou cancelar qualquer uma delas.

#### Scenario: Listagem no painel
- **WHEN** o administrador abre a aba de convocações do painel
- **THEN** o sistema SHALL listar as convocações, das mais recentes para as mais antigas, com seus status

#### Scenario: Cancelamento por administrador
- **WHEN** o administrador cancela uma convocação aberta
- **THEN** o sistema SHALL marcá-la como cancelada, removê-la do dashboard e registrar o administrador responsável

#### Scenario: Membro sem perfil de administrador
- **WHEN** um membro comum tenta encerrar ou cancelar uma convocação
- **THEN** o sistema SHALL recusar a ação, exceto quando ele for o autor da própria convocação e ela estiver aberta
