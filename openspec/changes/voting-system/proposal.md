## Why

O cerne da Governança da Tekuá é a participação ativa e democrática de seus membros. Atualmente, não há uma ferramenta digital para debates e votações formais, o que dificulta a centralização de decisões importantes. Implementar um sistema de votação robusto garante transparência, registro histórico e facilita o engajamento da comunidade em temas estratégicos.

## What Changes

Implementar o Sistema de Votação e Debates:
1.  Criação da tela principal de Votações (`/voting`).
2.  Interface para administradores registrarem novos "Temas" para debate/votação usando um editor de texto rico (Rich Text).
3.  Sistema de comentários e discussões dentro de cada tema.
4.  Funcionalidade de votação (Sim, Não, Abstenção) com controle de unicidade por membro.
5.  Visualização de resultados em tempo real (dashboard de apuração parcial/final).
6.  Integração com o Supabase para persistência de `votes`, `comments` e `discussion_topics`.

## Capabilities

### New Capabilities
- `voting-system`: Plataforma de deliberação coletiva incluindo criação de pautas, debates em texto rico e sistema de votação formal para membros.

### Modified Capabilities
- None

## Impact

- `src/pages/Voting.tsx`: Nova página principal de lista de pautas.
- `src/pages/TopicDetail.tsx`: Visualização detalhada, editor de texto rico e área de comentários.
- `supabase/migrations`: Novas tabelas `discussion_topics`, `comments` e `votes`.
- `translation.json`: Termos de deliberação, votação e estados de pauta.
