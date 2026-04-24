## 1. Infraestrutura e Banco de Dados

- [x] 1.1 Criar a migração SQL para a tabela `documents` (colunas: id, title, description, category, file_path, created_at, created_by).
- [x] 1.2 Configurar o bucket `official-docs` no Supabase Storage.
- [x] 1.3 Implementar políticas RLS: Administrador (All), Autenticado (Select).

## 2. Interface de Administração

- [x] 2.1 Adicionar a sub-seção "Documentação" no `AdminPanel.tsx` ou em componente separado.
- [x] 2.2 Desenvolver o formulário de upload com campos para metadados e seleção de arquivo.
- [x] 2.3 Implementar a listagem de documentos com ações de Visualizar e Excluir.

## 3. Lógica e Tradução

- [x] 3.1 Desenvolver as funções utilitárias no frontend para interagir com o bucket e a tabela (upload, list, delete).
- [x] 3.2 Adicionar termos i18n relacionados à gestão documental nos arquivos `translation.json`.
- [x] 3.3 Adicionar feedback de progresso no upload e alerts de confirmação para exclusão.

## 4. Testes e Validação

- [x] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [x] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [x] Validar o build final e a conformidade com as especificações.
