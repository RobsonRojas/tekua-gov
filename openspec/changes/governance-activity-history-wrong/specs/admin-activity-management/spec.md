## MODIFIED Requirements

### Requirement: Central de Auditoria Global
O portal SHALL fornecer aos administradores uma interface para monitorar todas as interações de todos os membros. Esta interface SHALL estar integrada como uma aba no Painel Administrativo.

#### Scenario: Consulta de Histórico Geral no Painel Admin
- **WHEN** um usuário com papel de administrador acessa o Painel Administrativo e seleciona a aba "Histórico de Atividades".
- **THEN** o sistema SHALL exibir uma tabela cronológica contendo Nome do Usuário, Email, Ação Realizada e Data/Hora dentro do contexto do painel.

#### Scenario: Filtro por Usuário Específico
- **WHEN** o administrador digita o nome de um membro no campo de filtro de usuário na aba de atividades.
- **THEN** o sistema SHALL filtrar a lista para exibir exclusivamente as ações realizadas por aquele membro.

## REMOVED Requirements

### Requirement: Acesso via Card em Serviços de Governança
**Reason**: A visualização de atividades globais é sensível e deve ser restrita apenas aos administradores no painel dedicado.
**Migration**: Administradores devem usar a nova aba no Painel Administrativo; o card foi removido para membros comuns.
