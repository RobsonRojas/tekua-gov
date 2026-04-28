## 1. Frontend Refactoring

- [x] 1.1 Update `src/components/ActivityCard.tsx` to use local state for the activity's status, ensuring immediate update after a successful "Assumir" or "Finalizar" action.
- [x] 1.2 Update `src/hooks/useQueryWithCache.ts` to improve the `refetch` logic, ensuring it bypasses the initial cache-read on the next render.

## 2. Verification

- [x] 2.1 Navigate to the "Mural de Trabalho" and click "Assumir Tarefa" on an open task.
- [x] 2.2 Verify that the card status changes to "Em Execução" immediately without a manual refresh.
- [x] 2.3 Verify that the change persists after a manual page reload.
