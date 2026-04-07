## Context

A economia da dádiva da Vila Tekuá depende do reconhecimento mútuo. Este sistema estende a funcionalidade da carteira Surreal (`wallets`) para permitir que contribuições individuais sejam validadas pela comunidade, automatizando a recompensa sem necessidade de intervenção centralizada constante.

## Goals / Non-Goals

**Goals:**
- Permitir o registro descentralizado de contribuições.
- Implementar um mecanismo de validação social (confirmações).
- Automatizar pagamentos da Tesouraria baseados em consenso comunitário.
- Permitir configuração administrativa do nível de rigor (threshold de confirmação).

**Non-Goals:**
- Substituir o minting administrativo direto (que continuará existindo para casos excepcionais).
- Implementar um sistema de disputa complexo (a não-confirmação é o filtro inicial).

## Decisions

### 1. Modelo de Dados (Schema)
- **Tabela `contributions`**:
  - `id`: UUID (PK)
  - `user_id`: UUID (FK para profiles) - quem realizou o trabalho.
  - `beneficiary_id`: UUID (FK para profiles, opcional) - para quem foi o trabalho. Se NULL, assume-se Tekuá (Tesouraria).
  - `amount_suggested`: NUMERIC - quanto o usuário propõe receber.
  - `description`: TEXT - o que foi feito.
  - `evidence_url`: TEXT - link para prova do trabalho.
  - `status`: ENUM ('pending', 'completed', 'rejected') - estado da contribuição.
- **Tabela `contribution_confirmations`**:
  - `id`: UUID (PK)
  - `contribution_id`: UUID (FK para contributions)
  - `user_id`: UUID (FK para profiles) - quem confirmou.
  - UNIQUE(contribution_id, user_id) - impede votos duplicados.
- **Tabela `governance_settings`**:
  - `key`: TEXT (PK) - ex: 'min_contribution_confirmations'
  - `value`: JSONB - ex: 3

### 2. Fluxo de Validação e Pagamento
- Utilizaremos uma **Function RPC** `confirm_contribution`.
- Cada vez que um usuário confirma uma tarefa:
  1. Registra na `contribution_confirmations`.
  2. Conta o número atual de confirmações para aquela contribuição.
  3. Compara com o valor em `governance_settings`.
  4. Se `count >= threshold` e `status == 'pending'`:
     - Altera `status` para 'completed'.
     - Chama internamente a lógica de `admin_mint_currency` (via SECURITY DEFINER) para transferir o valor para o `user_id` autor da contribuição.

### 3. Interface de Usuário (UI)
- **Dashboard**: Aba ou Seção "Reconhecimento" ou "Mural de Trabalho".
- **Filtros**: "Minhas Contribuições", "Para Validar".
- **Admin**: Nova seção em "Configurações de Governança" para ajustar o threshold.

## Risks / Trade-offs

- **Conluio (Sybil Attack)**: Usuários criando contas fakes para se auto-confirmarem. 
  - *Mitigação*: Exigir que apenas perfis com certo nível ou tempo de casa (`profiles.role`) possam confirmar tarefas.
- **Inflação**: Muitos registros de baixo valor aprovados rapidamente.
  - *Mitigação*: Threshold configurável e visibilidade pública de todas as transações para auditoria social.
- **Custo de Transação**: Múltiplas confirmações geram muitas linhas na tabela.
  - *Trade-off*: Necessário para auditabilidade total da governança.
