## 1. Banco de Dados e Migrações

- [x] 1.1 Criar migração SQL `20261122000000_add_updated_at_to_topic_votes.sql` adicionando a coluna `updated_at` à tabela `topic_votes`
- [x] 1.2 Atualizar a definição da tabela `topic_votes` em `full_database_schema.sql` com a coluna `updated_at`

## 2. Ajustes de Layout e Feedback em TopicDetail

- [x] 2.1 Atualizar `src/pages/TopicDetail.tsx` adicionando regras de contenção de overflow e quebra de palavras (`overflowWrap: 'break-word'`, `wordBreak: 'break-word'`, `maxWidth: '100%'`) no container de descrição da pauta e tags internas
- [x] 2.2 Substituir alertas intrusivos por notificações no `Snackbar` com mensagens detalhadas em caso de erro no envio de comentários e no registro de votos
- [x] 2.3 Garantir que erros retornados pela API durante `castVote` ou `addComment` exibam feedback claro para o usuário

## 3. Testes e Validação Obrigatória de Build

- [x] 3.1 Executar testes unitários relevantes (`npm test src/pages/TopicDetail.test.tsx`) e ajustar se necessário
- [x] 3.2 Executar validação de build obrigatória do workspace (`npm run build`) e garantir zero erros
