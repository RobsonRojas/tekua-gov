## Why

Na Área de Dádivas, quem recebe uma dádiva registra o uso pelo botão "Eu utilizei isso", mas não há como deixar um agradecimento. A gratidão, que é o que dá sentido à economia da dádiva, fica invisível: não é registrada, não é celebrada e não é lembrada. Além disso, o card da dádiva corta o texto, o que dificulta a leitura da oferta.

## What Changes

- Ao clicar em "Eu utilizei isso", o membro passa a ver um campo **opcional** para deixar uma mensagem de agradecimento, emojis, ou ambos.
- A mensagem **não aparece no mural** (Área de Dádivas). O registro da gratidão é **público**, e aparece no novo dashboard público.
- Um lembrete semanal por **email e notificação** pergunta a quem utilizou dádivas na semana, e ainda não deixou agradecimento, se gostaria de deixar um comentário de agradecimento. O texto é: "Você recebeu alguma dádiva essa semana? Gostaria de deixar um agradecimento para apoiar a alma caridosa."
- O membro pode adicionar ou editar o agradecimento depois, pelo histórico das próprias dádivas utilizadas.
- Novo **dashboard público das gratidões**, com as gratidões registradas. Cada gratidão pode ser marcada como privada pelo autor, e deixa de aparecer no dashboard público.
- **Ingratidões** (quando o membro registra um sentimento negativo sobre a dádiva) ficam **sempre privadas por enquanto**: não aparecem no dashboard público nem no mural.
- Correção do texto cortado no card da dádiva.

## Capabilities

### New Capabilities

- `gift-gratitude`: agradecimento opcional (mensagem e emojis) ao registrar o uso de uma dádiva, lembrete semanal por email e notificação para quem ainda não agradeceu, e possibilidade de adicionar ou editar o agradecimento depois.
- `gratitude-dashboard`: dashboard público das gratidões, com controle de privacidade por registro e restrição de ingratidões a privadas.

### Modified Capabilities

- `gift-points-system`: o registro de uso da dádiva passa a aceitar um agradecimento opcional. A contabilização dos Pontos de Dádiva não muda.

## Impact

- **Banco de dados**: colunas novas em `gift_usages` (mensagem, emojis, tipo gratidão ou ingratidão, visibilidade pública ou privada) e uma migração.
- **Backend**: `supabase/functions/api-gifts` (uso com agradecimento, edição do agradecimento, listagem das gratidões públicas), `award_gift_points` (sem mudança de pontos), `notify-engine` (novo evento de lembrete), e uma função agendada semanal.
- **Frontend**: `src/pages/GiftsArea.tsx` (campo opcional no fluxo de uso e correção do card), nova página do dashboard público de gratidões, e histórico de uso para editar o agradecimento.
- **Traduções**: `src/locales/{pt,en}/translation.json`.
- **Sem impacto em**: pontos de dádiva, saldo de Surreais, tarefas e demandas.
