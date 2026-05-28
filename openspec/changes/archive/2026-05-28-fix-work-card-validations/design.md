## Context

Atualmente o cartão de demanda (`WorkCard` ou equivalente) exibe as informações sobre validação mas não permite uma edição ágil por parte dos administradores. Além disso, foi reportado um erro que impede que membros do conselho consigam confirmar o trabalho. Estes problemas prejudicam a eficiência da governança e atrasam o pagamento das recompensas.

## Goals / Non-Goals

**Goals:**
- Adicionar um campo de edição do número de validações necessárias (threshold) visível apenas para administradores, integrado no cartão de trabalho.
- Corrigir a validação/RLS e funções no frontend para que membros do conselho consigam confirmar com sucesso atividades publicadas.

**Non-Goals:**
- Não iremos refatorar totalmente a tela do mural ou as políticas de RLS globais, apenas o mínimo necessário para corrigir esse fluxo de validação específico.

## Decisions

- **Admin Controls**: Utilizaremos a verificação baseada nos papéis (roles) do usuário. Se o papel atual do usuário for de administrador, exibiremos um componente de `Input` simplificado ao invés de apenas um texto exibindo o threshold, permitindo alterar e salvar via API.
- **Council Validation Bug**: Iremos analisar a função de confirmação (RPC `confirm_activity` ou equivalente no Edge Function/Frontend) para certificar que o papel de conselheiro ("council") não está sendo bloqueado em tarefas `community_consensus`.

## Risks / Trade-offs

- **Risk**: Modificar a validação pode inadvertidamente abrir brechas. → Mitigation: Vamos nos assegurar de usar as funções e policies existentes baseadas na role do Supabase.
