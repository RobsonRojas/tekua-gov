## 1. Ativação de Navegação Base

- [x] 1.1 Atualizar o redirecionamento do card de Governança no `src/pages/Home.tsx` para a nova rota `/governance`.
- [x] 1.2 Adicionar a rota `/governance` em `src/router.tsx` utilizando `ProtectedRoute`.

## 2. Implementação da Interface Hub

- [x] 2.1 Criar a página `src/pages/GovernanceServices.tsx`.
- [x] 2.2 Reutilizar o componente padrão de cards de serviço para listar: Votações, Tarefas, Documentos e Auditoria.
- [x] 2.3 Adicionar ícones correspondentes da biblioteca `lucide-react`.

## 3. Lógica de Redirecionamento e I18n

- [x] 3.1 Adicionar traduções para o Hub de Governança e seus cartões internos nos arquivos `translation.json`.
- [x] 3.2 Configurar links internos para os outros sistemas (serão preenchidos à medida que as pautas, votações e tarefas forem implementadas).

## 4. Testes e Validação

- [x] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [x] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [x] Validar o build final e a conformidade com as especificações.
