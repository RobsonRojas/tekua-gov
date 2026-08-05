## Why

A plataforma atualmente suporta apenas recompensas em Surreais para demandas do Work Wall. Para permitir pagamentos em moeda fiat e cobrir serviços que exigem liquidação em reais, precisamos adicionar suporte a Stripe para registro de valores em BRL e um fluxo de pagamento que utilize a chave Pix do executor quando a demanda for entregue.

## What Changes

- Adicionar campo de pagamento em fiat na criação de demandas no Work Wall, permitindo ao demandante informar o valor a pagar em BRL.
- Criar integração de Stripe no backend para registrar o valor fiat e preparar a captura de pagamento (por exemplo, criar `payment_intent` ou `checkout_session`).
- No perfil do usuário, fornecer uma seção de dados bancários para recebimento via Pix, incluindo chave Pix, nome do favorecido e CPF/CNPJ.
- Atualizar as visualizações de demanda para mostrar o valor fiat e exibir o status do pagamento.
- Implementar o fluxo de pagamento pós-entrega: quando o executor ou executores entregarem a demanda, o demandante poderá realizar o pagamento via Pix usando a chave cadastrada pelo executor.

## Capabilities

### New Capabilities
- `stripe-fiat-payments`: Registrar valores em BRL para demandas e iniciar um fluxo de pagamento fiat usando Stripe como orquestrador de pagamentos.
- `pix-receive-details`: Permitir que executores registrem dados bancários e chave Pix no perfil para receber pagamentos de demandas.

### Modified Capabilities
- `gift-economy-tasks`: Atualizar o modelo de criação de demandas para aceitar um valor fiat e tornar o pagamento de demandas compatível com um fluxo Pix pós-entrega.
- `user-profile`: Adicionar campos de recebimento Pix e exibir informações de pagamento no perfil do usuário.

## Impact

- `supabase/functions/api-work/index.ts`: aceitar novos parâmetros de demanda relacionados a `fiat_amount`, `currency`, `payment_method`, `payment_status` e preparar integração com Stripe.
- `supabase/functions/api-members/index.ts` ou equivalente: atualizar perfil do usuário para persistir dados bancários Pix e validar as entradas.
- `src/pages/CreateDemand.tsx`: adicionar campos de valor em BRL e instruções de pagamento fiat ao criar demanda.
- `src/pages/Profile.tsx`: adicionar aba ou seção para cadastro de chave Pix e dados bancários do executor.
- `src/pages/TaskDetail.tsx` e `src/components/ActivityCard.tsx`: mostrar detalhes de valor fiat, status de pagamento e link para pagamento via Pix quando a demanda estiver entregue.
- Notificações: avisar o demandante quando a demanda for entregue e o executor quando seus dados Pix estiverem usados para pagamento.

## Non-goals

- Não é necessário implementar ainda a liquidação automática de Pix entre contas reais.
- Não é necessário suportar outros métodos de pagamento além de Stripe/BRL para o registro de valor e Pix para recebimento no primeiro ciclo.
