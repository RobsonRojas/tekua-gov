## Context

O Projeto Tekua Governance é uma Single Page Application (SPA) desenvolvida com Vite e React. Para ser acessível globalmente de forma confiável e rápida, necessita de uma plataforma de infraestrutura que ofereça deploy contínuo (CD) e automação de builds. O Vercel é a escolha ideal devido à sua integração profunda com frameworks de frontend modernos e sua rede global de borda (Edge Network).

## Goals / Non-Goals

**Goals:**
- Configurar deploys automáticos em cada Push para a branch `main`.
- Garantir que todas as rotas do client-side (React Router) funcionem em produção sem erros 404 (SPA Rewrites).
- Gerenciar segredos de conexão com o Supabase de forma segura.
- Oferecer ambientes de Preview para Pull Requests (PRs).

**Non-Goals:**
- Configuração de CI/CD para o banco de dados Supabase (Edge Functions, RLS) neste fluxo (será via Supabase CLI).
- Deploy em outros provedores (Netlify, AWS CloudFront) além do Vercel.

## Decisions

- **Framework Preset**: Utilizar o preset "Vite" no Vercel.
- **Build Command**: `npm run build` (conforme `package.json`).
- **Output Directory**: `dist`.
- **Routing**: O arquivo `vercel.json` deve incluir um rewrite global `/(.*) -> /` para permitir o funcionamento do React Router.
- **Environment Variables**: Todas as variáveis iniciadas com `VITE_` devem ser cadastradas no painel da Vercel para estarem disponíveis no build do client-side.

## Risks / Trade-offs

- **Build Duration**: O comando `tsc -b` pode aumentar o tempo de build em projetos muito grandes. Se necessário, pode-se otimizar omitindo o type check no build (não recomendado para produção).
- **Vercel API Limits**: Gratuito para projetos de hobby, mas pode haver limites de bandwith/build-hours para projetos comerciais em escala.
