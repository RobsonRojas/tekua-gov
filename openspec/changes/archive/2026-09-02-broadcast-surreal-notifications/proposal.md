## Why

Quando membros ganham surreais (via conclusão de atividades, transferências ou distribuições), essa conquista permanece invisível para a comunidade. Isso reduz o reconhecimento social e limita oportunidades de engajamento. Notificar broadcasts de recebimentos de surreais celebra contribuições, incentiva participação, e amplifica o senso de comunidade em torno da economia de surreais.

## What Changes

- Quando uma transação de surreais é criada (recebimento), todos os membros cadastrados recebem uma notificação no app e por email
- A notificação inclui dados do recebimento (valor, remetente, contexto)
- A notificação abre uma página de "recibo de surreais" mostrando os detalhes da transação, um convite para ganhar mais surreais, e um botão direto para o work-wall
- A notificação é disparada atomicamente quando o recebimento é registrado

## Capabilities

### New Capabilities

- `surreal-receipt-notifications`: Sistema de notificações broadcast para recebimentos de surreais (app + email)
- `surreal-receipt-landing`: Página de destino pública para visualizar detalhes de um recebimento de surreais

### Modified Capabilities

- `wallet`: Requer ação de "criar notificação" no momento que uma transação é registrada (delta: adicionar trigger ou RPC que dispara notificação)
- `notifications`: Requer suporte a notificações de tipo "surreal_receipt" com dados estruturados (delta: estender schema de notificações)

## Impact

- **APIs**: `api-wallet` pode precisar de nova ação ou RPC para disparar notificações; `api-notifications` pode precisar estender tratamento de tipos
- **Database**: Possivelmente novos campos em `notifications` table (se não existirem genéricos); `transactions` pode precisar trigger para chamar RPC de notificação
- **Frontend**: Nova página de landing pública (sem autenticação necessária); integração com sistema de notificações existente
- **Email**: Templates de email para notificações de recebimento de surreais
- **Deployment**: Possível necessidade de atualizar Edge Functions (`api-wallet`, `api-notifications`)
