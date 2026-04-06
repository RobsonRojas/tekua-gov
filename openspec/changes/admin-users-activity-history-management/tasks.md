## 1. Interface Administrativa de Auditoria

- [ ] 1.1 Criar a página `src/pages/AdminActivityHistory.tsx`.
- [ ] 1.2 Adicionar o link de navegação no painel de administração lateral para a nova rota.
- [ ] 1.3 Desenvolver a estrutura de filtros (Buscar por Usuário, Data e Ação).

## 2. Integração de Dados e Consultas Supabase

- [ ] 2.1 Implementar a consulta ao Supabase enriquecendo os dados da tabela `activity_logs` com o nome e email do usuário (via Foreign Key em `profiles`).
- [ ] 2.2 Adicionar paginação e ordenação descendente por data de criação.
- [ ] 2.3 Garantir que a consulta respeite os filtros selecionados na interface.

## 3. Visualização de Dados e Análise

- [ ] 3.1 Implementar dashboard simplificado com estatísticas de participação e atividades por dia nos últimos 30 dias.
- [ ] 3.2 Adicionar ícones e cores distintivas por categoria de ação para facilitar a leitura rápida.
- [ ] 3.3 Configurar traduções (i18n) para os novos termos de auditoria no `translation.json`.

## 4. Testes e Validação

- [ ] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [ ] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [ ] Validar o build final e a conformidade com as especificações.
