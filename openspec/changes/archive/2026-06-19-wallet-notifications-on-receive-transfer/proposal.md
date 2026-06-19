## Why

O recebimento de Surreais é um evento muito importante na jornada do usuário e no reconhecimento de seu trabalho. Atualmente, o sistema de transferências não notifica o usuário beneficiário sobre a entrada de fundos em sua carteira digital. Adicionar alertas no "notifications hub" garantirá que os membros fiquem imediatamente informados sobre novas entradas, mantendo o engajamento na plataforma.

## What Changes

- Geração de uma notificação in-app (na tabela `notifications` ou chamada ao `notify-engine`) sempre que uma transferência P2P de Surreais for concluída com sucesso.
- O alerta indicará quem enviou o valor e a quantia transferida.
- O usuário que recebeu verá o aviso no ícone de sino (hub de notificações) e, ao clicar, poderá ser redirecionado para o extrato da carteira.

## Capabilities

### New Capabilities
Nenhum

### Modified Capabilities
- `notifications-hub`: Adição de um novo tipo de alerta referente a recebimento de Surreais.
- `wallet-system`: A função de transferência no backend (Edge Function) deverá emitir o evento/notificação ao destinatário.

## Impact

- Impacta a Edge Function `api-wallet` (ou quem processa a transferência) para gerar a notificação.
- Não introduz quebra de compatibilidade (Non-breaking).
- Impacto positivo direto na retenção e retorno do usuário à plataforma.
