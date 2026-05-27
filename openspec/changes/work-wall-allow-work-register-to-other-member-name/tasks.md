## 1. Ajustes no Frontend (Formulário)

- [x] 1.1 Localizar o componente de submissão de atividade (ex: `WorkRegistrationForm.tsx`).
- [x] 1.2 Adicionar um campo de seleção `executor_id`, listando os membros da comunidade (podendo usar autocomplete ou dropdown).
- [x] 1.3 Garantir que o valor padrão seja o próprio usuário logado caso ele não altere o campo.
- [x] 1.4 Modificar o payload de envio (submit) para incluir o `executor_id`.

## 2. Ajustes no Backend (API/RPC)

- [x] 2.1 Identificar a função (ex: Edge Function `api-work` ou RPC Supabase) que recebe os dados de criação da atividade.
- [x] 2.2 Modificar a lógica de inserção para utilizar o `executor_id` fornecido no campo `author_id` ou equivalente, em vez de forçar o ID de quem originou a requisição.
- [x] 2.3 Certificar que, ao registrar para terceiros, isso não quebre notificações automáticas (ex: se o executor precisa ser notificado de que um trabalho foi registrado em seu nome, incluir esse log).

## 3. Validação

- [x] 3.1 Submeter um registro de trabalho associado a si mesmo e confirmar que a recompensa/validação segue o fluxo normal.
- [x] 3.2 Submeter um registro associado a outro membro e verificar se o trabalho fica atrelado ao membro escolhido corretamente no histórico.
