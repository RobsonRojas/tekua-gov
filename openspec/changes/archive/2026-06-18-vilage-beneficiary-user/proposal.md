# Proposta: Atribuir função de beneficiário para usuário de Vila

Resumo

- O painel administrativo deve permitir atribuir a função `beneficiary` a um usuário específico.
- Quando um usuário possuir essa função e for designado como beneficiário por "Vila" (village) para tarefas, ele poderá confirmar tarefas cujo beneficiário seja a vila.

Motivação

Atualmente, confirmações de tarefas para beneficiários de tipo "Vila" só podem ser feitas por perfis com papéis administrativos ou membros do Conselho Transversal. Algumas vilas têm um representante local que deveria poder confirmar tarefas vinculadas à sua vila sem exigir permissões administrativas.

Escopo

- Frontend: adicionar ação no painel administrativo para atribuir a role `beneficiary` a um usuário e indicar a vila a que pertence.
- Backend: garantir checagem de autorização para aceitar confirmações de usuários com role `beneficiary` quando a tarefa tiver `beneficiary_type: 'village'` e corresponder à vila do usuário.
- Segurança: apenas admins no painel podem atribuir a role `beneficiary`.

Critérios de aceitação

- No painel admin, é possível selecionar um usuário e atribuir a role `beneficiary` e associar `village_id`.
- Um usuário com role `beneficiary` pode confirmar tarefas cujo `beneficiary_type` é `village` e `beneficiary_id` corresponda ao `village_id` do usuário.
- Todas as alterações são auditadas e registradas.
