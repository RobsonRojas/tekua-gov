## 1. Migração de Auditoria e Logs

- [ ] 1.1 Criar a migração SQL para a tabela `activity_logs` (id, user_id, type, description, metadata, created_at).
- [ ] 1.2 Implementar RLS para visualizar logs apenas do próprio usuário.
- [ ] 1.3 Criar índice em `user_id` e `created_at` para otimização de busca.

## 2. Interface do Histórico no Perfil

- [ ] 2.1 Adicionar a aba "Atividade" na página `src/pages/Profile.tsx`.
- [ ] 2.2 Desenvolver o componente de Timeline ou lista de histórico integrada.
- [ ] 2.3 Implementar funcionalidade de filtragem por tipo de evento (Opcional).

## 3. Lógica de Log e I18n

- [ ] 3.1 Desenvolver função utilitária no frontend para disparar logs em eventos-chave (Login, Voto, Tarefa, Perfil).
- [ ] 3.2 Injetar chamadas de log em: `Login.tsx`, `TopicDetail.tsx`, `TasksBoard.tsx` e `Profile.tsx`.
- [ ] 3.3 Adicionar traduções (i18n) para descrições amigáveis no `translation.json`.

## 4. Testes e Validação

- [ ] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [ ] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [ ] Validar o build final e a conformidade com as especificações.
