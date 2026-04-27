## 1. Conexão e Registro do Repositório no Vercel

- [x ] 1.1 Acessar [vercel.com](https://vercel.com) e autenticar com a conta do GitHub onde o repositório `tekua-gov` está hospedado.
- [x] 1.2 Importar o repositório `tekua-gov` no painel da Vercel.
- [x] 1.3 Selecionar o framework preset "Vite" na tela de configuração.

## 2. Configurações de Ambiente e Roteamento

- [x] 2.1 Cadastrar as variáveis de ambiente na seção "Environment Variables" do Vercel:
    - `VITE_SUPABASE_URL`: URL de sua instância Supabase.
    - `VITE_SUPABASE_ANON_KEY`: Anon Key de sua instância Supabase.
- [x] 2.2 Validar o arquivo `vercel.json` na raiz do projeto com a regra de rewrite global (`/(.*) -> /index.html`).

## 3. Lançamento e Validação do Deploy

- [x] 3.1 Iniciar o primeiro build automatizado a partir da branch `main`.
- [x] 3.2 Verificar o log de build no painel da Vercel para erros de compilador/lint.
- [x] 3.3 Acessar a URL de produção gerada (ex: `tekua-gov.vercel.app`) e validar se a autenticação e as rotas SPA estão funcionando corretamente.

## 4. Testes e Validação

- [ ] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [ ] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [x] Validar o build final e a conformidade com as especificações.
