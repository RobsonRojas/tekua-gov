## Context

Após a transição da plataforma para uma arquitetura multi-cargo que utiliza o array `roles` na tabela `profiles` (ex: `['admin', 'transversal_council']`), a política RLS "Admins can manage documents" na tabela `public.documents` tornou-se incompatível. Ela realiza a checagem apenas na coluna de texto legada `role = 'admin'`, impedindo administradores cuja credencial esteja definida apenas no array `roles` de cadastrar ou excluir metadados de documentos oficiais.

## Goals / Non-Goals

**Goals:**
- Atualizar a política RLS "Admins can manage documents" para suportar a checagem do papel `'admin'` tanto na coluna `role` quanto no array `roles`.
- Permitir que administradores com múltiplos papéis (ex: Jordi Pascoal) gerenciem documentos com sucesso.

**Non-Goals:**
- Modificar outras políticas da tabela `public.documents` (como visualização pública).
- Alterar a estrutura de colunas da tabela `public.documents`.

## Decisions

### 1. Criar uma Nova Migração de Banco de Dados
Criaremos uma migração em `supabase/migrations/20260605000003_fix_documents_admin_policy.sql` que remove a política RLS existente e a recria com a nova lógica.

- **Definição da Política Atual:**
  ```sql
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
  ```
- **Nova Definição da Política:**
  ```sql
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR 'admin' = ANY(profiles.roles))
  )
  ```

- **Alternativa Considerada:** Alterar a Edge Function para usar a chave de serviço (`service_role`) para desviar do RLS ao gravar os metadados do documento.
  - *Raciocínio:* Utilizar `service_role` de forma indiscriminada enfraquece a segurança em camadas (Defense in Depth). Manter o RLS no banco de dados e atualizá-lo garante que a segurança seja mantida diretamente na camada do Postgres.

## Risks / Trade-offs

- **[Risco]** Impactar a performance de consultas na tabela `documents` devido à subquery no RLS.
  - *Mitigação:* A tabela `profiles` possui índice na chave primária `id`, o que garante que a busca `profiles.id = auth.uid()` seja instantânea.
