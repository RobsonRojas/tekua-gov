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

- **Rich Text Engine**: Utilizar `React Quill` ou similar para o formulário de criação do administrador.
- **Data Model**:
    - `discussion_topics`: Metadados e conteúdo da pauta.
    - `comments`: Discussões associadas a cada tópico.
    - `votes`: Registros de votos individuais (vinculados ao `topic_id` e `user_id`).
- **Permissions**: Apenas administradores criam temas e encerram votações. Todos os membros debatem e votam.

## Risks / Trade-offs

- **Concurrency**: Muitos votos simultâneos podem exigir tratamento de locks ou filas no banco (Supabase resolve isso bem para o volume esperado).
- **Auditability**: Mudar o estado de uma pauta deve ser uma ação registrada para evitar manipulações pós-fechamento.
