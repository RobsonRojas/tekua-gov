## Context

Um bug na adição de membros pelo administrador está fazendo com que o e-mail não seja persistido no banco de dados. O e-mail é um dado crítico para a identidade e comunicação (convites/login) na plataforma.

## Goals / Non-Goals

**Goals:**
- Identificar por que o e-mail está sendo descartado ou ignorado no fluxo de salvamento.
- Corrigir a passagem de parâmetros do formulário de frontend até a função do backend (Supabase).
- Garantir que o e-mail seja validado e inserido na respectiva coluna (normalmente `email` na tabela de autenticação ou perfis) sem causar conflitos.

**Non-Goals:**
- Não reestruturaremos a tabela de usuários ou o módulo de autenticação. Apenas corrigiremos a omissão do dado de e-mail na rotina já existente.

## Decisions

- **Análise do Payload**: Vamos depurar o frontend (`AddMemberForm` ou semelhante) para garantir que `email` existe no payload enviado.
- **Análise do Endpoint**: Vamos checar a RPC do Supabase ou a Edge Function chamada para cadastrar membros. A probabilidade maior é que o campo `email` não esteja sendo desestruturado do JSON de input ou falte ser passado para o `INSERT`.
- Correção no ponto falho, garantindo tipagem TypeScript correta.

## Risks / Trade-offs

- **Risk**: Alterar a RPC de criação de usuário pode quebrar o login caso mexa nos metadados de autenticação do Supabase.
- **Mitigation**: Testaremos a criação localmente validando se a conta é criada no `auth.users` corretamente com o email fornecido, além da tabela pública `users` ou `profiles`.
