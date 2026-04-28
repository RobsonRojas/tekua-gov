## 1. Banco de Dados (Segurança)

- [ ] 1.1 Criar migração para habilitar Row-Level Security (RLS) na tabela `ledger_entries`.
- [ ] 1.2 Implementar política de visualização (`SELECT`) para que membros vejam apenas seus próprios registros financeiros.
- [ ] 1.3 Implementar política de visualização total para administradores.
- [ ] 1.4 Verificar e garantir que nenhuma política de escrita (`INSERT/UPDATE/DELETE`) exista para a tabela `ledger_entries` (proteção de imutabilidade).

## 2. Auditoria e Varredura

- [ ] 2.1 Executar script de varredura no banco de dados para listar todas as tabelas do schema `public` sem RLS habilitado.
- [ ] 2.2 Corrigir qualquer outra tabela identificada na varredura.

## 3. Verificação e Testes

- [ ] 3.1 Validar via API Client (ou script de teste) que um usuário autenticado NÃO consegue visualizar entradas de ledger de terceiros.
- [ ] 3.2 Validar que tentativas de alteração direta nos registros de ledger via API retornam erro de permissão.
- [ ] 3.3 Confirmar que o fluxo de transferências e recompensas (Edge Functions) continua operando normalmente.
