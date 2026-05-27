## Context

Atualmente, ao registrar um trabalho no sistema, o autor logado é assumido automaticamente como sendo o executor da tarefa (`author_id`). No entanto, frequentemente membros precisam registrar tarefas que foram executadas por outros membros (por exemplo, quando o executor não possui acesso imediato à plataforma).

## Goals / Non-Goals

**Goals:**
- Permitir a seleção explícita de um "executor" ao registrar um trabalho.
- Salvar a atividade atribuindo o crédito (`author_id` ou equivalente) ao executor selecionado, de forma que os pontos e o histórico sejam atribuídos corretamente àquela pessoa.
- O membro que está submetendo a atividade fica registrado como quem lançou a atividade, mas o beneficiário direto é o executor.

**Non-Goals:**
- Não alteraremos o sistema de validação (Community Consensus) em si; apenas garantiremos que os fluxos sejam iniciados corretamente para o executor.

## Decisions

- Modificar o formulário `WorkRegistrationForm` (ou equivalente no frontend) inserindo um campo de busca/seleção de membros (combobox) focado em "Membro Executor".
- A API (provavelmente a Edge Function `api-work` ou a RPC inserção) precisará receber este `executor_id` opcional.
- Se `executor_id` for enviado e válido, ele será mapeado para a coluna que define quem ganha a recompensa (`author_id`). 

## Risks / Trade-offs

- **Risk**: Usuários mal-intencionados podem registrar spam em nome de outros membros.
- **Mitigation**: A validação por `community_consensus` continua ativa. Atividades fraudulentas não serão validadas e, consequentemente, não gerarão recompensas. Além disso, o histórico (quem criou a atividade vs quem a executou) poderá ser registrado na auditoria.
