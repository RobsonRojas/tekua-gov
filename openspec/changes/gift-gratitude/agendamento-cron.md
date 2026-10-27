# Agendamento do lembrete semanal de agradecimento (tarefa 2.5)

A função `cron-gift-gratitude-reminder` precisa ser chamada uma vez por semana. Ela usa o mesmo critério de autorização do `cron-rewards-notify`: o cabeçalho `Authorization: Bearer <CRON_SECRET>` (ou a service role).

## Como agendar

Use o mesmo mecanismo que já agenda o `cron-rewards-notify` neste projeto. Se for `pg_cron` com `net.http_post`, o job seria semelhante a este (substitua o segredo pelo valor real, e não o versione):

```sql
SELECT cron.schedule(
  'gift-gratitude-reminder',
  '7 12 * * 1',  -- segunda-feira, 12:07 UTC (minuto fora de :00/:30 para evitar pico)
  $$
  SELECT net.http_post(
    url := 'https://rhpcenqbelifilylwujy.supabase.co/functions/v1/cron-gift-gratitude-reminder',
    headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>', 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);
```

## Antes de agendar

1. A migração `20261027000000_gift_gratitude` precisa estar aplicada (cria `gift_gratitude_reminders` e a função de candidatos).
2. A função `cron-gift-gratitude-reminder` precisa estar publicada com `--no-verify-jwt`.
3. Confirme que o `CRON_SECRET` é o mesmo usado pelo `cron-rewards-notify`.

## Como conferir

- Resposta esperada: `{"candidates": N, "notified": M, "failed": F, "weekStart": "AAAA-MM-DD"}`.
- Rodar duas vezes na mesma semana não reenvia: o segundo retorno deve ter `notified: 0`.
- Para remover: `SELECT cron.unschedule('gift-gratitude-reminder');`
