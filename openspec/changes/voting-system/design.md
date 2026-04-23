## Context

O portal Tekua Governance atualmente não possui uma interface para deliberação coletiva. Para que a Associação funcione digitalmente, é necessário que membros possam debater propostas e votar formalmente sobre elas dentro da plataforma, com garantias de transparência e unicidade de voto.

## Goals / Non-Goals

**Goals:**
- Prover interface para administradores criarem "Pautas de Discussão" com editor rico.
- Permitir que membros comentem e debatam as pautas em tempo real.
- Sistema de votação binária (Sim/Não) ou com abstenção.
- Visualização de resultados parciais e finais das votações.
- Prevenir votos duplicados por membro em uma mesma pauta.

**Non-Goals:**
- Voto secreto (nesta fase, os votos serão auditáveis/públicos para membros).
- Votação por procuração (apenas o membro logado vota).

## Decisions

- **Rich Text Engine**: Utilizar `React Quill` para conteúdo rico. O conteúdo deve ser salvo no formato **JSONB** para suportar múltiplos idiomas (`pt`, `en`).
- **Data Model**:
    - `discussion_topics`: `id`, `title` (JSONB), `content` (JSONB), `status` (open, closed), `created_at`.
    - `comments`: `id`, `topic_id`, `user_id`, `content` (TEXT), `created_at`.
    - `votes`: `id`, `topic_id`, `user_id`, `option` (ENUM: 'yes', 'no', 'abstain'), `created_at`.
- **Routing**: Seguir padrão RESTful: `/dashboard/voting/:id` para detalhe da pauta.
- **Mutations (Edge Functions)**:
    - `vote_registration`: Função para registrar voto garantindo unicidade e validação de tempo.
    - `topic_management`: Funções administrativas para abrir/fechar pautas.
- **Permissions**: Apenas perfis `admin` ou `moderator` criam temas e encerram votações. Todos os membros autenticados debatem e votam.

## Risks / Trade-offs

- **Concurrency**: Muitos votos simultâneos podem exigir tratamento de locks ou filas no banco (Supabase resolve isso bem para o volume esperado).
- **Auditability**: Mudar o estado de uma pauta deve ser uma ação registrada para evitar manipulações pós-fechamento.
