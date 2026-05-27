## 1. Verificação do Frontend (Admin)

- [x] 1.1 Localizar o componente do formulário de adição de membros (`AddMemberForm.tsx` ou similar, normalmente em `src/app/admin/members/` ou componentes de gerência).
- [x] 1.2 Inspecionar a função de submit (`onSubmit` ou action) para verificar se o campo `email` do estado/formulário está sendo passado no payload da API.
- [x] 1.3 Se o campo estiver faltando no envio, adicioná-lo ao objeto payload com a devida validação (zod ou similar).

## 2. Verificação do Backend (API/Supabase)

- [x] 2.1 Localizar o endpoint, Server Action ou RPC correspondente que realiza o cadastro do usuário (ex: `api/members`, RPC `add_member` ou Server Action em `actions.ts`).
- [x] 2.2 Verificar se o campo `email` está sendo extraído e incluído no objeto de `INSERT` na tabela (ou na chamada do Supabase Admin Auth).
- [x] 2.3 Atualizar a query/RPC para garantir que a coluna `email` receba o valor fornecido.

## 3. Teste e Validação

- [x] 3.1 Adicionar um novo membro de teste através do painel.
- [x] 3.2 Checar o banco de dados para garantir que a coluna `email` do novo usuário foi populada corretamente.
