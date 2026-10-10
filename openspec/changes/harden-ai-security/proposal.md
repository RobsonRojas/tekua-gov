## Why

A proteção contra manipulação do Oráculo baseada em RegEx (expressões regulares) é facilmente contornável (jailbreak). Adicionalmente, a sanitização contra Cross-Site Scripting (XSS) no backend por meio do uso de `.replace()` remove responsabilidades do frontend e é ineficaz para ataques avançados ou outputs arbitrários do modelo.

## What Changes

- Remover as validações RegEx (`ignore all previous instructions`) da Edge Function.
- Integrar as ferramentas avançadas de `safetySettings` (HARM_CATEGORY) do Gemini.
- Fortalecer as restrições diretamente no `BASE_SYSTEM_PROMPT`.
- Remover a sanitização manual `replace(/<script.../`) do backend e exigir a higienização no frontend.

## Capabilities

### Modified Capabilities

- `ai-guidance`: A camada de segurança passa a delegar sanitização de UI para o frontend e injeções de prompt para o Safety Settings e o block prompt nativo.

## Impact

- `supabase/functions/ai-handler/index.ts`
- Novo requerimento no Frontend para uso do `DOMPurify` ou renderizador seguro.
