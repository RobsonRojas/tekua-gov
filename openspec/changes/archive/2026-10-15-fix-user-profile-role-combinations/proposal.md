## Why

Atualmente o sistema não permite que um usuário tenha simultaneamente os perfis de "Membro" e "Conselho Transversal". Isso é um bug, pois deve ser possível que um usuário assuma qualquer combinação válida de tipos de perfil dentro da organização.

## What Changes

- Permitir que os tipos de perfil "Membro" e "Conselho Transversal" sejam atribuídos simultaneamente a um usuário.
- Remover restrições na interface de usuário (e API/banco se houver) que impedem seleções múltiplas arbitrárias de perfis, desde que aplicável, mantendo a consistência dos cargos.

## Capabilities

### New Capabilities

- Nenhuma nova capability introduzida.

### Modified Capabilities

- `multi-profile-management`: Suporte à combinação livre de tipos de perfil para um mesmo usuário, incluindo 'Membro' e 'Conselho Transversal'.

## Impact

- Frontend: Menu de seleção de perfis e exibição de múltiplos perfis na listagem de usuários.
- Banco de Dados (Supabase/PostgreSQL): Caso as roles sejam checadas via Enum/constraints exclusivas ou triggers.
- APIs e Políticas RLS (Row Level Security): Garantir que permissões combinadas não causem conflito.
