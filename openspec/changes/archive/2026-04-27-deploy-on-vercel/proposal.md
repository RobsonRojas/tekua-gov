## Why

O portal Tekua Governance exige um ambiente de hospedagem que suporte o ciclo de desenvolvimento ágil (CI/CD) e forneça alta performance para membros em diferentes localizações. O Vercel oferece integração nativa com o ecossistema Vite/React, suporte a visualizações de branch (Preview Deployments), gerenciamento seguro de segredos (Environment Variables) e otimização automática de assets para o PWA (Progressive Web App), garantindo que o portal esteja sempre disponível e atualizado a cada commit na `main`.

## What Changes

Implementar a configuração de deploy automatizado no Vercel:
1.  **Configuração de SPA**: Verificar e otimizar o `vercel.json` para garantir que todas as rotas do React Router sejam redirecionadas corretamente para o `index.html`.
2.  **Variáveis de Ambiente**: Mapear e configurar no painel da Vercel as chaves `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` necessárias para a conexão com o backend.
3.  **Fluxo de Build**: Definir a configuração do pipeline de build para executar `npm run build` e servir o diretório `dist/`.
4.  **Otimização de Asset Caching**: Configurar cabeçalhos de cache apropriados no Vercel para melhorar a performance de carregamento inicial.

## Capabilities

### New Capabilities
- `hosting-vercel`: Infraestrutura de hospedagem escalável com deploy contínuo, suporte a SPA e gestão de ambiente para o Portal Tekuá.

### Modified Capabilities
- None

## Impact

- `vercel.json`: Arquivo central de configuração de redirecionamento e headers.
- `README.md`: Instruções de deploy e configuração de ambiente.
- `CI/CD Workflow`: Automação de deploys vinculados ao repositório GitHub.
- `Performance`: Redução de latência de carregamento através da rede de borda (Edge Network) da Vercel.
