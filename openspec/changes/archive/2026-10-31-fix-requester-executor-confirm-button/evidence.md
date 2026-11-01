# Evidência de verificação

## Regra da RPC `confirm_activity` (tarefa 3.3)

Executada em um Postgres 15 descartável (container Docker, sem dados reais) com um esquema mínimo: `auth.uid()`, `profiles`, `activities`, `activity_confirmations` e um `execute_currency_transfer` que apenas registra o pagamento. Os cenários rodaram contra a função da migração atual e depois contra a migração nova (`20261025000000_fix_requester_executor_confirm.sql`).

| Cenário | Antes (migração `20261021000000`) | Depois (migração nova) |
| --- | --- | --- |
| S1: solicitante que também é executor aprova (`requester_approval`) | rejeitado: "You cannot confirm your own work" | sucesso, atividade concluída, pagamento de 10 ao solicitante |
| S2: executor que não é o solicitante (`requester_approval`) | rejeitado | rejeitado (mantido) |
| S3: executor em `community_consensus` | rejeitado | rejeitado (mantido) |
| S4: membro da comunidade em `community_consensus` | sucesso, 1 confirmação, não concluída | igual |

O pagamento ocorreu uma única vez, e apenas no cenário S1.

## Interface (tarefas 2.1, 3.1, 3.2)

Testes de `src/pages/TaskDetail.test.tsx`:

- solicitante que também é executor, em `requester_approval` aguardando validação: botão "Confirmar Tarefa" habilitado. Confirmado que este teste **falha** com a condição anterior (`isWorker`) e passa com a correção.
- executor que não é o solicitante, em `community_consensus`: botão desabilitado.

Os 7 testes do arquivo passam. A suíte completa mantém as mesmas 42 falhas pré-existentes que já existiam no HEAD (`api.test.ts`, `AuthContext`, `ThemeContext` e outros), sem nenhuma falha nova.

## Administrador que também é executor (tarefa 4.5)

Decisão tomada conforme a spec `community-validation`: em `requester_approval` o administrador pode confirmar; em `community_consensus` continua bloqueado.

- RPC (Postgres descartável): S5 administrador-executor em `requester_approval` conclui e paga 10 ao administrador; S6 o mesmo administrador em `community_consensus` é rejeitado.
- Frontend: 2 testes novos (admin-executor habilitado em `requester_approval`; desabilitado em `community_consensus`). Os 7 testes de `TaskDetail` passam.

## Aplicação em produção (tarefa 4.3)

- Antes de aplicar, a definição de `confirm_activity` em produção foi comparada com a migração `20261021000000`: o corpo é idêntico, então só a guarda muda.
- Aplicada com `supabase db query --linked -f` apenas com o arquivo da nova migração. Não foi usado `supabase db push`: o histórico remoto só registra 2 das migrações do repositório, e um `push` tentaria reaplicar as demais.
- Releitura da definição após a aplicação: a guarda nova está presente e há uma única versão da função.

## Ainda não verificado

- Publicação do frontend e teste em produção (tarefa 4.4).