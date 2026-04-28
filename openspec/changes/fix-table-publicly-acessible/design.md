## Context

O sistema de carteiras da Tekuá utiliza uma arquitetura de ledger de partidas dobradas para garantir a integridade financeira. Recentemente, foi identificado que a tabela `public.ledger_entries` foi criada sem a habilitação do Row-Level Security (RLS), expondo todos os registros financeiros do projeto a qualquer pessoa com a URL da API. Esta alteração visa fechar essa brecha de segurança seguindo as melhores práticas do Supabase.

## Goals / Non-Goals

**Goals:**
- Habilitar RLS na tabela `ledger_entries`.
- Implementar políticas de `SELECT` granulares para membros e administradores.
- Garantir a imutabilidade do ledger proibindo `UPDATE` e `DELETE` via RLS.

**Non-Goals:**
- Alterar a lógica de negócios das Edge Functions ou dos Triggers de sincronização de saldo.
- Refatorar a estrutura da tabela `ledger_entries`.

## Decisions

### 1. Habilitação de RLS e Política Restritiva por Padrão
- **Decisão**: Habilitar RLS e não definir políticas de `INSERT`, `UPDATE` ou `DELETE` para roles públicas.
- **Racional**: No Supabase, o RLS nega qualquer operação que não tenha uma política explícita de permissão. Como o ledger deve ser escrito apenas por funções `SECURITY DEFINER` (que rodam com privilégios de sistema), não há necessidade de permitir `INSERT` direto via API.

### 2. Política de Leitura (SELECT) Baseada em Posse
- **Decisão**: Criar uma política de leitura que permite ao usuário ver entradas onde o `wallet_id` aponta para uma carteira de sua propriedade (`wallets.profile_id = auth.uid()`).
- **Racional**: Permite que o extrato na interface do usuário continue funcionando de forma segura, filtrando os dados automaticamente no nível do banco de dados.

### 3. Acesso Administrativo Global
- **Decisão**: Adicionar uma política de bypass ou uma condição `OR` para usuários com role `admin`.
- **Racional**: Necessário para auditoria e suporte técnico.

## Risks / Trade-offs

- **[Risco] Performance de Consultas**: A política de RLS executa uma verificação adicional (subquery ou join) para cada linha retornada.
    - **Mitigação**: Os índices em `ledger_entries.wallet_id` e `wallets.profile_id` garantem que a verificação de posse seja extremamente rápida.
