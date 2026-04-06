## 1. Banco de Dados e Migração

- [ ] 1.1 Criar a migração SQL para as tabelas `discussion_topics`, `comments` e `votes`.
- [ ] 1.2 Implementar RLS para proteção de votos (Um usuário, um voto) e permissões de escrita para administradores em pautas.

## 2. Interface de Deliberação

- [ ] 2.1 Criar a página principal de Votações `src/pages/Voting.tsx` (Lista de pautas ativas/passadas).
- [ ] 2.2 Desenvolver a tela de detalhe `src/pages/TopicDetail.tsx`.
- [ ] 2.3 Integrar um editor de texto rico (ex: TinyMCE/React Quill) no formulário do administrador.

## 3. Lógica de Votação e Discussão

- [ ] 3.1 Implementar sistema de comentários em thread dentro dos tópicos.
- [ ] 3.2 Desenvolver os botões de votação com trava de unicidade de voto por `user_id`.
- [ ] 3.3 Adicionar visualização gráfica de resultados de votação.
- [ ] 3.4 Adicionar traduções (i18n) nos arquivos `translation.json`.

## 4. Testes e Validação

- [ ] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [ ] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [ ] Validar o build final e a conformidade com as especificações.
