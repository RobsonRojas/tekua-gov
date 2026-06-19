## 1. Database Migration

- [x] 1.1 Create migration to change `gifts.provider_id` FK from `auth.users` to `profiles.id`

## 2. Edge Function

- [x] 2.1 Verify `fetchGifts` join works after FK fix (no code change needed — the existing query `provider:profiles!provider_id` will resolve correctly)

## 3. Translations

- [x] 3.1 Add `gifts` namespace to `src/locales/pt/translation.json` (area, create, recordUsage, usageRecorded)
- [x] 3.2 Add `gifts` namespace to `src/locales/en/translation.json`

## 4. Frontend Cleanup

- [x] 4.1 Remove fallback inline strings (`|| '...'`) from `GiftsArea.tsx` and navigation
