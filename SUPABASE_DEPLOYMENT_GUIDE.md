# Guia de Deploy: Tekuá Governance no Supabase

Este guia descreve os passos necessários para subir o projeto Tekuá Governance em uma nova conta/projeto do Supabase utilizando o script consolidado e as Edge Functions.

## 1. Preparação do Projeto no Supabase
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard).
2. Clique em **"New Project"** e escolha sua organização.
3. Defina um nome para o projeto e uma senha forte para o banco de dados.
4. Selecione a região mais próxima de seus usuários.
5. Aguarde a finalização da criação do projeto.

## 2. Configuração do Banco de Dados
1. No menu lateral, acesse **SQL Editor**.
2. Clique em **"New Query"**.
3. Abra o arquivo `full_database_schema.sql` gerado na raiz deste repositório.
4. Copie todo o conteúdo e cole no editor do Supabase.
5. Clique em **"Run"**.
   - *Nota: Isso criará todas as tabelas, permissões de RLS, triggers e funções necessárias.*

## 3. Deploy das Edge Functions
Você precisará do [Supabase CLI](https://supabase.com/docs/guides/cli) instalado localmente.

1. Faça login no CLI:
   ```bash
   npx supabase login
   ```
2. Vincule seu projeto local ao novo projeto (você precisará do Project ID que aparece na URL do dashboard):
   ```bash
   npx supabase link --project-ref seu-project-id
   ```
3. Faça o deploy de todas as funções:
   ```bash
   npx supabase functions deploy --no-verify-jwt
   ```
   - *Nota: O flag `--no-verify-jwt` é usado porque as funções verificam o JWT internamente via código para maior flexibilidade.*

## 4. Configuração de Segredos (Secrets)
As Edge Functions precisam de acesso ao banco de dados e à chave de serviço para operações administrativas. No terminal, execute:

```bash
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```
*(Você encontra a Service Role Key em: Settings -> API -> service_role)*

## 5. Configuração do Frontend
1. No seu ambiente local (ou na sua plataforma de deploy como Vercel/Netlify), atualize o arquivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://seu-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-nova-anon-key
   ```
2. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 6. Verificação Final
1. Acesse a aplicação.
2. Crie um novo usuário (Sign Up).
3. Verifique no menu **"Meu Perfil"** se a aba **"Histórico de Atividades"** carrega sem erros.
4. Verifique no Dashboard do Supabase (Table Editor) se os dados estão sendo inseridos corretamente.

---
**Suporte:** Caso encontre erros de CORS, certifique-se de que o domínio da sua aplicação está listado em: *Authentication -> Settings -> Allow List*.
