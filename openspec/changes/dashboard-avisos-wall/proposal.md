## Why

Para garantir que informações críticas e anúncios cheguem rapidamente a todos os membros, precisamos de um Mural de Avisos diretamente no dashboard. Atualmente, os avisos podem se perder em outros canais de comunicação, e um destaque inicial ao entrar na plataforma melhorará o engajamento e o alinhamento da comunidade.

## What Changes

- Criação de uma nova tabela/entidade para armazenar "Avisos/Anúncios".
- Exibição de um componente "Mural de Avisos" no topo ou em uma área de destaque no Dashboard inicial.
- Os avisos aparecerão resumidos em formato de lista ou cartões.
- Ao clicar em um aviso, será possível visualizar todos os seus detalhes em um modal ou página dedicada.

## Capabilities

### New Capabilities
- `dashboard-avisos`: Nova capacidade para exibição, listagem e detalhamento de avisos globais no painel inicial do usuário.

### Modified Capabilities

## Impact

- **Frontend**: Criação dos componentes `NoticeWall` (listagem) e `NoticeDetailModal` (detalhes). Adição desses componentes na view principal do Dashboard.
- **Backend/Supabase**: Criação da tabela `notices` ou `announcements`, configurando RLS (Row Level Security) para leitura pública por membros e escrita restrita aos administradores.
