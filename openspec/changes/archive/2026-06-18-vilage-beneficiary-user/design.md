# Design: Implementar papel `beneficiary` associado à Vila

Contexto

- O sistema já possui papéis (`admin`, `transversal_council`, `member`) e uma entidade `village` (vila).
- Tarefas contém campos `beneficiary_type` (e.g., `member`, `village`) e `beneficiary_id`.

Como funciona

1. Dados e modelo
   - Adicionar na tabela `profiles`/`users` os campos:
     - `roles`: array (já existe) pode incluir `beneficiary`
     - `village_id`: opcional, quando o usuário for um beneficiário associado a uma vila

2. Painel Admin (frontend)
   - Na tela de gerenciamento de membros (`MemberManagement`), adicionar opções para:
     - `makeBeneficiary` — atribuir a role `beneficiary` e selecionar `village_id`.
   - Mostrar badge/Chip indicando `Beneficiário (Vila)` quando aplicável.

3. Backend / Edge Function
   - Na função `moderateActivity` / ou no endpoint de confirmação de tarefas, aceitar confirmações quando:
     - usuário.role inclui `beneficiary`
     - activity.beneficiary_type === 'village'
     - activity.beneficiary_id === user.village_id
   - Implementar checagem e retorno claro de erro quando não autorizado.

4. Segurança e auditoria
   - Somente usuários com papel `admin` podem atribuir `beneficiary` via painel.
   - Todas as mudanças persistem com logs de auditoria (who, what, when).

5. Migrações
   - Fornecer migration SQL para adicionar `village_id` a `profiles` se ainda não existir.

Considerações

- Evitar permissões amplas: `beneficiary` dá permissão limitada apenas para confirmar tarefas da vila associada.
- Testes unitários para backend e integração para a UI do painel admin.
