## Context

Com o aumento de uso da plataforma, surgem trabalhos inválidos ou spam que precisam ser retirados do mural para não poluir o processo de validação da comunidade. Atualmente, os administradores não possuem uma forma ágil de remover esses trabalhos deixando rastro de auditoria.

## Goals / Non-Goals

**Goals:**
- Prover um botão de exclusão de demandas no `WorkCard` exclusivo para administradores.
- Exigir uma justificativa textual ao realizar essa exclusão.
- Registrar a ação e a justificativa no sistema para fins de auditoria/histórico.

**Non-Goals:**
- Não criaremos um fluxo complexo de aprovação/revisão (appeal) para demandas excluídas neste momento. Será uma exclusão direta (ou soft-delete) baseada na autoridade do administrador.

## Decisions

- **Ação no Frontend**: O `WorkCard` exibirá um ícone/botão de lixeira apenas se `user.role === 'admin'`. Ao clicar, abrirá um modal/dialog solicitando a justificativa.
- **Processamento Backend**: A remoção chamará uma Edge Function ou RPC chamada `delete_work_activity` (ou similar) que receberá o ID da atividade e o texto da justificativa.
- **Auditoria**: A RPC excluirá a tarefa (ou mudará seu status para `deleted`/`rejected`) e criará uma entrada na tabela de logs/auditoria registrando o motivo, o administrador responsável e a data.

## Risks / Trade-offs

- **Risk**: Deleção acidental sem possibilidade de recuperação rápida (caso seja hard-delete).
- **Mitigation**: Usar exclusão lógica (soft-delete, alterando status para `archived` ou `rejected`) em vez de deletar o registro do banco de dados permanentemente, mantendo a integridade referencial.
