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
Este sistema utiliza as tabelas `activities`, `activity_evidence` e `activity_confirmations` definidas no [Framework Unificado de Economia de Dádiva](../user-surreal-digital-currency-wallet/framework-design.md).

- **Configuração de Atividade**: Contribuições de trabalho registradas pelo usuário serão criadas com `type = 'contribution'` e `validation_method = 'community_consensus'`.
- **Tabela `governance_settings`**:
  - `key`: TEXT (PK) - ex: 'min_contribution_confirmations'
  - `value`: JSONB - ex: 3

### 2. Fluxo de Validação e Pagamento
- Utilizaremos a **Edge Function** `process_activity_validation`.
- O gatilho de pagamento (`execute_currency_transfer`) é disparado automaticamente quando o threshold de confirmações é atingido.

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
