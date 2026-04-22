## Context

O portal Tekua Governance já integra o sistema de recompensas em "Surreais" através do quadro de tarefas. Para tornar essa economia tangível e funcional, os membros precisam de uma carteira digital segura onde possam gerenciar seus saldos, transferir moedas para outros membros e auditar seu próprio extrato histórico.

## Goals / Non-Goals

**Goals:**
- Implementar a infraestrutura de saldo persistente para cada perfil.
- Garantir a atomização das transações financeiras (débito/crédito simultâneos).
- Prover uma interface simples de transferência entre membros via email ou nome.
- Disponibilizar uma carteira de Tesouraria Administrativa para gestão do suprimento total da Tekuá.

**Non-Goals:**
- Integração com sistemas bancários reais (Boleto, PIX, Cartão).
- Conversão para criptomoedas de blockchain pública (foco em ledger interno seguro).
- Mecanismo de câmbio para moedas fiduciárias neste primeiro momento.

## Decisions

- **Unified Framework**: Esta funcionalidade segue as especificações do [Framework Unificado de Economia de Dádiva](./framework-design.md).
- **PostgreSQL Functions (RPC)**: Utilizar funções SQL (**Edge Functions + RPC**) rodando no banco para processar transferências. Isso evita inconsistências (ex: saldo negativo por race condition no client-side).
- **Consistência Atômica**: Toda transação deve registrar o débito na origem, o crédito no destino e um novo registro na tabela `ledger` dentro de uma única transação de banco.
- **Auditoria de Tesouraria**: O perfil institucional da Tekuá (`profiles.role == 'admin'` ou uma conta específica de Tesouraria) manterá a carteira mestre para geração de liquidez comunitária.
- **UI Components**:
    - `WalletBalance`: Componente de exibição de saldo com toggle para ocultar valores.
    - `TransactionHistory`: Tabela ou lista com filtros por tipo de transação (Crédito/Débito).
    - `TransferSheet`: Modal ou Drawer para envio de moedas.

## Risks / Trade-offs

- **Security of Balance Updates**: Se a RLS não for configurada corretamente, membros poderiam "editar" seu próprio saldo via API. Deve-se restringir o update direto na tabela `wallets` e forçar o uso da função RPC protegida.
- **Concurrency**: Em cenários de muitas transações simultâneas, o bloqueio (locking) de registros de saldo pode causar lentidão se não for bem administrado.
