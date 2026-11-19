## Why

Hoje qualquer membro pode publicar uma demanda ou registrar um trabalho prometendo uma recompensa em surreais que não possui: o pagamento sai da Tesouraria (cunhagem) na confirmação, sem lastro no beneficiário. Quando o beneficiário é um membro (privado, não a vila), a transferência deve sair da carteira dele. Isso desvincula a recompensa de quem se beneficia do trabalho e permite promessas vazias. O beneficiário deve ter o saldo e ele deve ficar comprometido desde o cadastro.

## Changes

- Criar uma demanda (`createActivity`) ou registrar um trabalho com beneficiário membro (`submitActivity`) passa a exigir que o beneficiário tenha **saldo disponível** ≥ valor da recompensa; caso contrário o cadastro é recusado com mensagem clara.
- No cadastro bem-sucedido, o valor é **reservado** na carteira do beneficiário: continua no saldo total, mas fica **indisponível** para transferências, novas reservas, estornos administrativos e qualquer outro uso.
- Na confirmação da atividade, a reserva é consumida como **transferência direta da carteira do beneficiário para cada executor** (sem passar pela Tesouraria). Com N executores, são reservados e pagos N × valor.
- Beneficiário "Tekuá/aldeia" continua sendo pago pela Tesouraria (cunhagem).
- Se a atividade for rejeitada/removida, a reserva é liberada integralmente.
- Beneficiário "Tekuá/aldeia" (sem membro) mantém o fluxo atual: sem reserva e sem débito do beneficiário.
- A carteira exibe saldo total, valor reservado e saldo disponível; formulários de demanda/registro mostram o saldo disponível do beneficiário e bloqueiam o envio quando insuficiente.
- `CreateDemand` já coleta `beneficiaryId`, mas a API o ignora; passa a ser honrado.

## Capabilities

### New Capabilities
- `surreal-reservation`: reserva de surreais na carteira do beneficiário para garantir o pagamento de demandas e trabalhos (criação, consumo, liberação, saldo disponível).

### Modified Capabilities
- `work-registration`: criar demanda / registrar trabalho exige saldo disponível do beneficiário e gera reserva.
- `wallet-system`: carteira distingue saldo total, reservado e disponível; débitos respeitam o disponível.

## Impact

- Banco: `wallets.reserved_balance`, nova tabela de reservas, RPCs `submit_activity`, `confirm_activity` (pagamento dos executores a partir da reserva do beneficiário), `perform_transfer`/`execute_currency_transfer`, `admin_adjust_wallet_balance`, remoção/rejeição de atividade; migração para atividades abertas existentes (sem reserva retroativa).
- Edge Functions: `api-work` (`createActivity`, `submitActivity`, `deleteActivity`), `api-wallet` (`getBalance`).
- Frontend: `CreateDemand.tsx`, `RegisterWork.tsx`, `Wallet.tsx`, `WorkWall` (aviso de reserva), traduções pt/en.
- Testes: unitários/integração de RPC e testes de página.
