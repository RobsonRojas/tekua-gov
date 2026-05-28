## 1. Modelagem de Dados

- [x] 1.1 Criar a migration Supabase adicionando a tabela `announcements` (id, title, content, created_at, author_id).
- [x] 1.2 Configurar RLS: `SELECT` habilitado para todos os usuários autenticados. `INSERT/UPDATE/DELETE` para usuários com role `admin`.
- [x] 1.3 Gerar/Atualizar os tipos Typescript do banco de dados (se aplicável ao fluxo do projeto).

## 2. Componentes de UI (Frontend)

- [x] 2.1 Criar o componente `NoticeWall.tsx` que fará o fetch (buscando os 5 mais recentes) e renderizará uma lista enxuta de títulos e datas.
- [x] 2.2 Criar o componente `NoticeDetailModal.tsx` que recebe o ID ou objeto do aviso e exibe seu título e conteúdo formatado.
- [x] 2.3 Ligar o clique nos itens do `NoticeWall` para disparar a abertura do `NoticeDetailModal`.

## 3. Integração no Dashboard

- [x] 3.1 Importar e posicionar o componente `NoticeWall` na página principal do Dashboard logado.
- [x] 3.2 Criar dados de seed (ou inserir manualmente pelo banco via painel) para validar o funcionamento do mural na tela.
