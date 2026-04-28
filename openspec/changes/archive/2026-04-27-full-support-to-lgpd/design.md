## Context

O sistema atual armazena dados de membros (perfis, contribuições, votos, histórico) sem uma camada formal de gestão de privacidade. Para conformidade com a LGPD, precisamos rastrear quando o usuário aceitou os termos e fornecer ferramentas de autoatendimento para gestão de seus dados.

## Goals / Non-Goals

**Goals:**
- Adicionar campos de controle de consentimento na tabela `profiles`.
- Criar um componente de bloqueio/modal para aceitação de termos.
- Implementar uma Edge Function para agregação e exportação de dados pessoais.
- Implementar fluxo de exclusão de conta respeitando integridade referencial.

**Non-Goals:**
- Implementar gestão de cookies de terceiros (não utilizamos no momento).
- Automatizar a exclusão de backups físicos (fora do escopo da aplicação).

## Decisions

### 1. Rastreamento de Consentimento
Adicionaremos `accepted_terms_at` (timestamp) e `terms_version` (text) ao schema da tabela `profiles`.
**Rationale**: Simples de verificar no middleware de autenticação ou no carregamento do app para forçar a re-aceitação quando a versão dos termos mudar.

### 2. Edge Function `api-privacy`
Uma nova função para lidar com ações sensíveis de privacidade.
- **Action: `exportUserData`**: Consulta todas as tabelas relacionadas (`profiles`, `contributions`, `votes`, `activity_log`) filtrando pelo `user_id` e retorna um arquivo JSON consolidado.
- **Action: `requestAccountDeletion`**: Inicia o processo de remoção.

### 3. Estratégia de Exclusão (Right to be Forgotten)
Seguiremos uma abordagem híbrida:
- **Remoção Direta**: Perfis e dados de contato.
- **Anonimização**: Registros financeiros ou de governança que não podem ser excluídos por motivos de integridade (ex: votos já computados ou balanços). O `user_id` será substituído por um identificador anônimo (ex: "Membro Excluído").

## Risks / Trade-offs

- **[Risk]** → Exclusão acidental de dados financeiros. 
- **[Mitigation]** → Implementar restrições no banco de dados que impeçam a deleção de registros em tabelas de auditoria, forçando a anonimização em vez de deleção física.
- **[Trade-off]** → JSON vs PDF para exportação.
- **[Decision]** → JSON será o padrão para portabilidade (máquina), podendo ser adicionado um resumo em PDF futuramente para leitura humana facilitada.
