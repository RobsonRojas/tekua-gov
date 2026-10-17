## 1. Frontend

- [x] 1.1 Em `src/pages/SubmitTaskProof.tsx`, remover `attachments.length === 0` da condição `disabled` do botão "Enviar Prova", permitindo o envio sem evidências (manter a trava de `uploading`).
- [x] 1.2 Em `src/pages/SubmitTaskProof.tsx`, atualizar o título/texto da seção de evidências para indicar que é **opcional** (ex.: "Evidências do Trabalho (opcional)").
- [x] 1.3 Verificar se há testes ou outros pontos (ex.: `SubmitTaskProof` tests, rotas) que assumam a obrigatoriedade de evidência e ajustá-los.

## 2. Backend / Specs

- [x] 2.1 Confirmar que `submitProof` (`supabase/functions/api-work/index.ts`) aceita lista vazia de anexos e atualiza o status para `pending_validation` sem exigir evidência (sem alteração de código).

## 3. Validação

- [x] 3.1 Executar `npm run build` para garantir que nada quebrou.
- [x] 3.2 Executar `openspec validate make-task-evidence-optional --strict`.
- [x] 3.3 Verificar manualmente que é possível concluir uma tarefa sem anexar evidência e que ela chega a `pending_validation`.
