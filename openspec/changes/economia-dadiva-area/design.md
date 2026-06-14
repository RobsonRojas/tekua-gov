## Context

A Tekuá quer expandir sua economia comunitária além das tarefas formais ("Work Wall") e introduzir uma "Economia de Dádiva". Usuários podem disponibilizar recursos, ferramentas ou tempo sem custo financeiro. Quando outro membro utiliza essa dádiva, o provedor recebe "Pontos de Dádiva" como reconhecimento, criando um incentivo não-monetário para a generosidade.

## Goals / Non-Goals

**Goals:**
- Prover interface para cadastro e visualização de dádivas.
- Criar infraestrutura de banco de dados para armazenar dádivas e o histórico de uso.
- Estabelecer uma carteira secundária ou campo de "Pontos de Dádiva" (Gift Points) para os usuários.
- Automatizar a atribuição de pontos ao provedor quando uma dádiva for marcada como "utilizada" por um consumidor.

**Non-Goals:**
- Substituir a moeda oficial "Surreais" por pontos de dádiva. São economias paralelas (uma para trabalho formal, outra para generosidade).
- Sistema de reservas complexo ou agendamento para as dádivas. O fluxo inicial será apenas o registro de uso retroativo ou declaratório ("Eu utilizei isso").

## Decisions

- **Modelo de Dados (Database):**
  - Nova tabela `gifts`: `id`, `provider_id` (auth.users), `title`, `description`, `status` (active/inactive), `created_at`.
  - Nova tabela `gift_usages`: `id`, `gift_id`, `consumer_id`, `points_awarded`, `created_at`.
  - Adição da coluna `gift_points` (Inteiro, default 0) na tabela existente `wallets`.
  - *Rationale*: Reutilizar a tabela `wallets` minimiza o overhead de novas tabelas de saldo, mantendo todas as métricas de "riqueza" do usuário no mesmo lugar.
- **Backend (Edge Function):**
  - Criação de uma nova Edge Function `api-gifts` para desacoplar essa lógica do `api-work`.
  - Ação `recordUsage`: Insere em `gift_usages` e chama um RPC seguro no banco (`award_gift_points`) para incrementar atomicamente o `gift_points` do `provider_id`.
- **Frontend:**
  - Rota `/gifts` com a interface `GiftsArea.tsx`.
  - Exibição do saldo de "Pontos de Dádiva" no componente de `Profile` ou no próprio Header ao lado dos Surreais, ou apenas na seção da Carteira/Dádivas.

## Risks / Trade-offs

- **[Risco] Fraude de Uso (Farm de Pontos)** → Usuários podem declarar repetidas vezes que usaram a dádiva de um amigo para farmar pontos.
  - **Mitigação**: O RPC `award_gift_points` pode implementar um rate-limit diário por par (provider/consumer) ou limitar a 1 uso por pessoa por dádiva, dependendo da regra de negócios. No MVP, manteremos simples, mas com auditoria via tabela `gift_usages`.
