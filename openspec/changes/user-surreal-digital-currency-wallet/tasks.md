## 1. Banco de Dados e Lógica de Transação (Supabase/PostgreSQL)

- [ ] 1.1 Criar a migração para a tabela `wallets` (vinculada a `profiles` via `profile_id`).
- [ ] 1.2 Criar a migração para a tabela `transactions` (id, from_id, to_id, amount, description, created_at).
- [ ] 1.3 Implementar a função RPC no PostgreSQL para realizar transferências atômicas (débito/crédito simultâneos dentro de uma transação).
- [ ] 1.4 Configurar as políticas de RLS (Row Level Security) para garantir que apenas o proprietário da carteira possa ver seu saldo e transações.

## 2. Interface de Carteira de Membro (UI)

- [ ] 2.1 Criar a página de carteira `src/pages/Wallet.tsx` com visualização de saldo atual.
- [ ] 2.2 Desenvolver o componente de extrato de transações com filtros básicos.
- [ ] 2.3 Implementar o formulário de transferência entre membros (modal ou drawer).
- [ ] 2.4 Integrar o saldo da carteira no Dashboard para acesso rápido.

## 3. Gestão Administrativa e Tesouraria

- [ ] 3.1 Criar a página administrativa `src/pages/AdminTreasury.tsx` para emissão e gestão de Surreais.
- [ ] 3.2 Implementar a visualização de balanço consolidado da associação.
- [ ] 3.3 Adicionar as novas rotas protegidas no roteador da aplicação.

## 4. Testes e Validação

- [ ] 4.1 Implementar testes unitários para os componentes de interface e lógica de saldo (Vitest).
- [ ] 4.2 Implementar testes de integração/E2E cobrindo o fluxo de transferência e validação de saldo insuficiente (Playwright).
- [ ] 4.3 Validar a robustez das funções RPC contra falhas de concorrência e race conditions.
- [ ] 4.4 Adicionar traduções (i18n) para os novos termos de carteira e financeiro no `translation.json`.
