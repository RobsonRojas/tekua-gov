## Why

Atualmente, a coluna "Moderação" não está aparecendo para membros do "conselho transversal", mas fica visível para o "admin". O objetivo é democratizar o acesso à edição para que todos os membros possam participar do processo, enquanto a aprovação de moderação (decisão final) fique restrita aos administradores e aos membros do conselho transversal. Isso garante que a governança seja participativa na etapa de edição, mas controlada na etapa de aprovação.

## What Changes

- Tornar a coluna "Moderação" visível para todos os membros (qualquer papel) para fins de edição (podem sugerir edições/moderar).
- Limitar o botão/ação de **aprovação** (decisão de moderação) na coluna de "Moderação" apenas para membros do papel "conselho transversal" e "admin".

## Capabilities

### New Capabilities

### Modified Capabilities
- `activity-moderation`: Ajustar as permissões de visibilidade e ação de modo que a coluna de moderação seja visível para edição por qualquer membro e a aprovação restrita a admin/conselho transversal.
- `transversal-council-workflow`: Garantir que os papéis do conselho transversal tenham o privilégio adequado na UI para realizar as aprovações de moderação.

## Impact

- Frontend: O componente que renderiza a coluna de moderação precisará checar o papel do usuário logado (ex: via token JWT / `user.role`) para determinar se exibe os botões de edição para todos e os botões de aprovação apenas para `admin` e `conselho_transversal`.
- Backend/DB: As RLS (Row Level Security) do Supabase e as rotas de Edge Functions envolvidas na aprovação precisarão validar que apenas usuários do tipo `admin` ou `conselho_transversal` podem aprovar moderações, enquanto edições podem ser feitas por qualquer membro ativo.
