## 1. Backend e Edge Functions

- [x] 1.1 Definir o esquema JSON das ferramentas (`get_user_balance`, `get_activity_history`) na Edge Function `ai-handler`.
- [x] 1.2 Implementar o loop de dispatch de ferramentas na Edge Function (lidar com `function_call` e `function_response`).
- [x] 1.3 Criar funções auxiliares seguras para executar as queries do Supabase com o token do usuário.

## 2. Refatoração do Frontend

- [x] 2.1 Atualizar `gemini.ts` para suportar o novo formato de payload com ferramentas.
- [x] 2.2 Modificar `AIAgent.tsx` para detectar e exibir estados de "Chamada de Ferramenta" (ex: "Consultando saldo...").
- [x] 2.3 Melhorar a renderização de tabelas ou listas retornadas pelas ferramentas no chat.

## 3. Segurança e Auditoria

- [x] 3.1 Implementar logs de execução de ferramentas para monitorar o que a IA está consultando.
- [x] 3.2 Validar que os argumentos passados pelo LLM são sanitizados antes da execução.

## 4. Validação

- [x] 4.1 Testar se a IA consegue responder corretamente o saldo atual do usuário.
- [x] 4.2 Verificar se a IA falha graciosamente quando uma ferramenta retorna erro ou nenhum dado.
- [x] 4.3 Garantir que a IA não tente inventar ferramentas inexistentes.
- [x] 4.4 Validar se o projeto compila e executa sem erros após as mudanças (`npm run build`).
- [x] 4.5 Implementar e executar testes de integração para o fluxo de "tool calling".
