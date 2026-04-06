## Why

A transparência nas ações realizadas por cada membro é essencial para a confiança no sistema de governança da Tekuá. Atualmente, o usuário não possui uma forma simples de consultar o seu histórico de interações (votos, tarefas realizadas, logins efetuados). Implementar um histórico de atividades permite que o usuário tenha controle sobre suas ações e acompanhe o progresso de sua participação na vida da associação.

## What Changes

Implementar o Histórico de Atividades do Usuário:
1.  Criação de uma nova aba "Atividade" na página de Perfil (`src/pages/Profile.tsx`).
2.  Implementação de uma lista cronológica de ações (Timeline).
3.  Integração com as tabelas de `logs`, `votes` e `tasks` para compilar o histórico.
4.  Criação de uma tabela genérica `activity_logs` no Supabase para registrar eventos-chave omitidos pelas tabelas de negócio (ex: Login, Alteração de Senha).


## Capabilities

### New Capabilities
- `activity-history`: Registro cronológico e visual das ações realizadas pelo usuário na plataforma para fins de auditoria e monitoramento pessoal.

### Modified Capabilities
- None

## Impact

- `src/pages/Profile.tsx`: Adição de nova aba de visualização.
- `supabase/migrations`: Criação da tabela `activity_logs`.
- `API Layer`: Injeção de registros de log em handlers de autenticação e governança.
- `translation.json`: Termos de descrição de atividades (ex: "Você votou na pauta X", "Tarefa Y concluída").
