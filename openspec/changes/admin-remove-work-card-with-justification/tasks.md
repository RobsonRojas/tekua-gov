## 1. Ajustes no Frontend (WorkCard)

- [x] 1.1 Localizar o componente do cartão de trabalho (ex: `WorkCard.tsx`).
- [x] 1.2 Adicionar uma condicional para renderizar o botão/ícone de exclusão apenas se o papel do usuário (role) for `admin`.
- [x] 1.3 Criar um componente de Modal/Dialog que abre ao clicar em excluir, exigindo um campo de texto (`Justificativa`) que deve ter um tamanho mínimo (ex: 10 caracteres).
- [x] 1.4 Adicionar a chamada de exclusão no frontend enviando o `activity_id` e a `justification` e lidar com os estados de loading e erro.

## 2. Ajustes no Backend (API/Supabase)

- [x] 2.1 Criar ou atualizar a Edge Function ou RPC responsável pela exclusão (`delete_activity` / `delete_work_activity`).
- [x] 2.2 A função deve validar se quem está chamando é `admin`.
- [x] 2.3 A função deve garantir que a `justification` foi enviada.
- [x] 2.4 Realizar a remoção ou soft-delete (ex: alterar `status` para `deleted`) na tabela `activities` / `work_cards`.
- [x] 2.5 Inserir um registro na tabela de logs/auditoria registrando o `activity_id`, `admin_id` e a justificativa fornecida.

## 3. Validação do Mural

- [x] 3.1 Garantir que consultas ao mural excluam da listagem as atividades que foram removidas administrativamente.
- [x] 3.2 Testar o fluxo completo entrando como admin, preenchendo a justificativa e validando que o item sumiu da interface e está no log do banco.
