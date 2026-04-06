## 1. Ativação de Navegação Base

- [ ] 1.1 Atualizar o redirecionamento do card de Documentação no `src/pages/Home.tsx` para a rota `/documents`.
- [ ] 1.2 Registro da rota `/documents` no `src/router.tsx` com `ProtectedRoute`.

## 2. Construção da Interface de Visualização

- [ ] 2.1 Criar a página `src/pages/Documentation.tsx`.
- [ ] 2.2 Reutilizar o componente de listagem de documentos (ou criar um seccionado por categorias).
- [ ] 2.3 Adicionar campos de busca e filtros laterais.

## 3. Lógica Institucional e Tradução

- [ ] 3.1 Integrar a listagem com a tabela `documents` (Select Metadados).
- [ ] 3.2 Implementar função de visualização que gera URLs assinadas (Signed URLs) do Supabase Storage.
- [ ] 3.3 Adicionar traduções (i18n) para os novos termos nos arquivos `translation.json`.

## 4. Testes e Validação

- [ ] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [ ] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [ ] Validar o build final e a conformidade com as especificações.
