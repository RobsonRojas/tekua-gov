## Context

O commit `dc292ff` adicionou a migration `20260619000001_fix_gifts_provider_id_fk.sql` ao repositório, alterando a FK de `gifts.provider_id` de `REFERENCES auth.users` para `REFERENCES profiles(id)`. No entanto, essa migration nunca foi executada no banco de dados de produção/desenvolvimento. O PostgREST depende do schema cache para resolver joins, e como a FK ainda aponta para `auth.users`, o join `provider:profiles!provider_id` falha.

Além disso, `gift_usages.consumer_id` também referencia `auth.users` diretamente. Embora o `fetchGifts` atual não faça join com `profiles` via `gift_usages`, cenários futuros podem encontrar o mesmo erro.

## Goals / Non-Goals

**Goals:**
- Aplicar a migration de correção da FK de `gifts.provider_id` ao banco
- Recarregar schema cache do PostgREST
- Corrigir também `gift_usages.consumer_id` para prevenir erro similar

**Non-Goals:**
- Não alterar código da edge function ou frontend
- Não alterar lógica de negócio

## Decisions

### 1. Aplicar migration existente

**Decisão:** Executar `supabase migration up` ou o SQL diretamente.

A migration `20260619000001_fix_gifts_provider_id_fk.sql` já contém o SQL correto. Basta aplicá-la.

### 2. Corrigir `gift_usages.consumer_id`

**Decisão:** Criar nova migration para alterar a FK de `gift_usages.consumer_id` de `REFERENCES auth.users` para `REFERENCES profiles(id)`.

**Rationale:** Mesmo problema, mesma solução. Previne erro futuro se alguém adicionar um join com `profiles` via `consumer_id`.

### 3. Recarregar schema cache

Após aplicar as migrations, executar:
```sql
NOTIFY pgrst, 'reload schema';
```

## Risks / Trade-offs

- **[Registros órfãos]** `gift_usages.consumer_id` pode conter UUIDs que existem em `auth.users` mas não em `profiles`. A FK só será criada se todos os valores existentes em `consumer_id` tiverem correspondência em `profiles.id`. Se houver órfãos, será necessário criá-los em `profiles` primeiro.
