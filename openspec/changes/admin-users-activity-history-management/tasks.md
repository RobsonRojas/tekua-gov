## 1. Interface Administrativa de Auditoria

- [x] 1.1 Criar a página `src/pages/AdminActivityHistory.tsx`.
- [x] 1.2 Adicionar o link de navegação no painel de administração lateral para a nova rota.
- [x] 1.3 Desenvolver a estrutura de filtros (Buscar por Usuário, Data e Ação).

## 2. Integração de Dados e Consultas Supabase

- [x] 2.1 Implementar a consulta ao Supabase enriquecendo os dados da tabela `activity_logs` com o nome e email do usuário (via Foreign Key em `profiles`).
- [x] 2.2 Adicionar paginação e ordenação descendente por data de criação.
- [x] 2.3 Garantir que a consulta respeite os filtros selecionados na interface.

## 3. Visualização de Dados e Análise

- [x] 3.1 Implementar dashboard simplificado com estatísticas de participação e atividades por dia nos últimos 30 dias.
- [x] 3.2 Adicionar ícones e cores distintivas por categoria de ação para facilitar a leitura rápida.
- [x] 3.3 Configurar traduções (i18n) para os novos termos de auditoria no `translation.json`.

## 4. Testes e Validação

- [x] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [x] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [x] Validar o build final e a conformidade com as especificações.
