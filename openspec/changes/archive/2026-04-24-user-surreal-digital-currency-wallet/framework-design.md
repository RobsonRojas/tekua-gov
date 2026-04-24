# Framework Unificado: Economia de Dádiva & Moeda Surreal

Este documento estabelece o padrão técnico para todos os subsistemas que envolvem recompensas, tarefas e a moeda digital **Surreal**.

## 1. Modelo de Dados Unificado (Schema)

Para evitar a fragmentação entre "Tarefas" e "Contribuições", utilizaremos uma estrutura comum baseada em **Atividades**.

### Tabela `activities` (Atividades Comunitárias)
- `id`: UUID (PK)
- `title`: JSONB (i18n)
- `description`: JSONB (i18n)
- `type`: ENUM (`task`, `contribution`)
    - `task`: Criada por um solicitante (oferta).
    - `contribution`: Registrada pelo executor (proativo).
- `requester_id`: UUID (FK profiles, opcional) - Quem solicitou ou deve validar.
- `worker_id`: UUID (FK profiles, opcional) - Quem assumiu/realizou a atividade.
- `reward_amount`: NUMERIC (Valor em Surreais).
- `status`: ENUM (`open`, `in_progress`, `pending_validation`, `completed`, `rejected`).
- `validation_method`: ENUM (`requester_approval`, `community_consensus`).
- `min_confirmations`: INTEGER (Padrão: 3 para consenso comunitário).
- `geo_required`: BOOLEAN (Se exige prova georreferenciada).
- `created_at`: TIMESTAMPTZ.

### Tabela `activity_evidence` (Provas de Trabalho)
- `id`: UUID (PK)
- `activity_id`: UUID (FK activities)
- `worker_id`: UUID (FK profiles)
- `evidence_url`: TEXT (Link storage)
- `location`: GEOGRAPHY(POINT) (Opcional, para georeferenciamento)
- `submitted_at`: TIMESTAMPTZ.

### Tabela `activity_confirmations` (Validações)
- `id`: UUID (PK)
- `activity_id`: UUID (FK activities)
- `user_id`: UUID (FK profiles) - Quem validou.
- UNIQUE(`activity_id`, `user_id`).

### Tabela `ledger` (Livro Razão / Transações)
- `id`: UUID (PK)
- `from_wallet`: UUID (FK profiles ou ID da Tesouraria)
- `to_wallet`: UUID (FK profiles)
- `amount`: NUMERIC
- `activity_id`: UUID (FK activities, opcional)
- `type`: ENUM (`reward`, `transfer`, `administrative_adjustment`)
- `created_at`: TIMESTAMPTZ.

### Tabela `wallets` (Saldos em Tempo Real)
- `profile_id`: UUID (PK, FK profiles)
- `balance`: NUMERIC (Default 0)
- `updated_at`: TIMESTAMPTZ.

---

## 2. Fluxo de Execução (Edge Functions Only)

Toda a lógica de transferência de saldo deve ser protegida:

1. **`process_activity_validation`**:
    - Chamada via Edge Function.
    - Se `validation_method == 'requester_approval'` e `auth.uid() == requester_id`:
        - Marca atividade como `completed`.
        - Aciona `execute_currency_transfer` da Tesouraria -> `worker_id`.
    - Se `validation_method == 'community_consensus'`:
        - Registra em `activity_confirmations`.
        - Verifica se `count(confirmations) >= min_confirmations`.
        - Se sim, marca `completed` e aciona transferência.

2. **`execute_currency_transfer`**:
    - **SECURITY DEFINER** (Apenas servidor).
    - Executa em blocos `BEGIN / COMMIT` (Transação Atômica):
        - Insere no `ledger`.
        - Atualiza `wallets.balance` (Origem e Destino).
        - Verifica se saldo da origem não fica negativo (exceto Tesouraria).

---

## 3. Diretrizes de i18n e UI

- **Campos JSONB**: Sempre usar o formato `{ "pt": "Text", "en": "Text" }`. O frontend deve selecionar o idioma baseado no `profiles.language_preference`.
- **Visibilidade**: Todas as `activities` e `ledger` são públicas para membros (RLS), garantindo auditoria social.
- **Georeferenciamento**: O upload de evidência deve usar a browser API se `activities.geo_required == true`.
