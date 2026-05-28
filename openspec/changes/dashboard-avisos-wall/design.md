## Context

A plataforma precisa de um canal primário e integrado para anúncios globais, chamado "Mural de Avisos". Eles devem aparecer diretamente na página inicial (Dashboard) após o login.

## Goals / Non-Goals

**Goals:**
- Prover um espaço (feed/mural) no dashboard onde os últimos comunicados importantes sejam listados.
- Permitir que os usuários cliquem em cada comunicado para ler seu texto na íntegra.
- Permitir que a administração cadastre esses avisos (via painel administrativo ou inserção direta inicial).

**Non-Goals:**
- Não criaremos um sistema complexo de comentários ou "curtidas" nos avisos nesta fase. Será apenas uma via de mão única (comunicação top-down).

## Decisions

- **Estrutura de Dados**: Uma tabela simples `announcements` contendo `id`, `title`, `content` (markdown ou texto longo), `created_at` e `author_id`.
- **UI do Dashboard**: Um widget no lado direito ou no topo da página de visão geral. Mostra os 3 ou 5 avisos mais recentes.
- **Leitura**: Um clique num aviso abre um dialog/modal do sistema padrão exibindo o título, autor, data e conteúdo completo, evitando que o usuário saia do contexto do dashboard.

## Risks / Trade-offs

- **Risk**: Poluição visual no dashboard se os avisos ocuparem muito espaço.
- **Mitigation**: Exibiremos apenas um resumo (truncate) ou apenas os títulos no widget principal.
