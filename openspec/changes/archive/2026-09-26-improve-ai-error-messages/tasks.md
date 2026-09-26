## 1. Tratamento de Erros da IA

- [x] 1.1 Modificar `supabase/functions/ai-handler/index.ts` para interceptar de forma consistente exceções no loop de fallback ou fora dele.
- [x] 1.2 Retornar ou "streamar" uma resposta amigável ao cliente (ex: "Nossos sistemas de IA estão temporariamente indisponíveis. Por favor, tente novamente mais tarde.") em vez do erro técnico do SDK.
- [x] 1.3 Manter logs técnicos detalhados internamente via `console.error` no backend.

## 2. Validação e Qualidade

- [x] 2.1 Testar comportamento forçando um erro de chave/modelo para garantir que a resposta amigável apareça corretamente no frontend (Testado via Deploy).
- [x] 2.2 Validar se o backend compila corretamente.
- [x] 2.3 Executar validação de build geral (`npm run build`) para garantir a integridade da aplicação, conforme as Regras Específicas do Workspace (Tekuá).
