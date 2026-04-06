## ADDED Requirements

### Requirement: Plataforma de Deliberação
O sistema SHALL permitir o debate organizado e a tomada de decisão formal através de temas e votações.

#### Scenario: Criação de Tema por Administrador
- **WHEN** um administrador preenche o título e o conteúdo em texto rico (Rich Text) e define o prazo de encerramento.
- **THEN** o sistema salva a pauta como "Ativa" e a disponibiliza para todos os membros.

#### Scenario: Debate em Texto Rico
- **WHEN** um membro acessa a página de detalhes de um tema e insere um comentário.
- **THEN** o sistema registra o comentário e o exibe cronologicamente abaixo da descrição do tema.

### Requirement: Sistema de Votação Formal
O sistema SHALL permitir que membros exerçam seu direito de voto de forma segura e única.

#### Scenario: Votação Única
- **WHEN** um membro autenticado seleciona uma opção (Sim, Não, Abstenção) e confirma seu voto.
- **THEN** o sistema registra o voto associado ao seu ID e impede que ele vote novamente no mesmo tema.

#### Scenario: Apuração de Resultados
- **WHEN** uma votação é encerrada (tempo expirado ou ação do admin).
- **THEN** o sistema calcula as porcentagens de cada opção e exibe o resultado final para todos os membros.
