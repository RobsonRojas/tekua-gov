## Why

A Associação Tekuá fundamenta-se na Economia de Dádiva e na colaboração mútua. Para tangibilizar o valor das contribuições dos membros e incentivar a circulação de recursos internos, é necessário um sistema de moeda comunitária digital: o **Surreal**. Atualmente, não há um registro formal e automatizado de saldos ou transferências. Implementar uma carteira digital integrada ao portal permite:
- Reconhecer e recompensar membros por tarefas concluídas.
- Facilitar a troca de serviços e produtos entre os associados.
- Fornecer à administração uma ferramenta de gestão de estoque de incentivos (Tesouraria).
- Aumentar a transparência financeira da comunidade através de um extrato de transações auditável.

## What Changes

Implementar o Sistema de Carteira Surreal:
1.  **Carteira de Membro**: Nova seção `/wallet` onde o usuário pode visualizar seu saldo atual e o histórico de transações (extrato).
2.  **Envio de Surreais**: Interface para transferência de moedas entre membros (P2P), com busca por nome/perfil.
3.  **Tesouraria Administrativa**: Painel exclusivo para administradores gerenciarem o estoque central de Surreais da Tekuá e realizarem emissões controladas para membros.
4.  **Modelo de Dados**: Criação das tabelas `wallets` e `transactions` no Supabase com integridade garantida por funções de banco (débito/crédito atômico).
5.  **Integração com Quadro de Tarefas**: Preparar a base para que recompensas de tarefas concluídas sejam creditadas automaticamente.

## Capabilities

### New Capabilities
- `digital-wallet-system`: Infraestrutura para gestão de saldos, transferências e auditoria da moeda comunitária Surreal.

### Modified Capabilities
- `gift-economy-tasks`: Integrado para permitir o pagamento automático de recompensas.

## Impact

- `src/pages/Wallet.tsx`: Nova página de gestão financeira pessoal.
- `src/pages/AdminTreasury.tsx`: Nova página de gestão da tesouraria central.
- `supabase/migrations`: Tabelas de saldo e histórico; Triggers de auditoria.
- `src/components/WalletCard.tsx`: Resumo de saldo para exibição no Dashboard.
- `translation.json`: Termos financeiros (Saldo, Extrato, Transferir, Receber).
