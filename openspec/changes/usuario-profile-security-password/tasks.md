## 1. Reestruturação da Interface do Perfil

- [ ] 1.1 Adicionar suporte a `MUI Tabs` na página `src/pages/Profile.tsx`.
- [ ] 1.2 Criar componentes de aba para "Dados Pessoais" e "Segurança".
- [ ] 1.3 Mover formulário atual de perfil para a primeira aba.

## 2. Implementação do Formulário de Segurança

- [ ] 2.1 Criar componente de formulário para Troca de Senha na segunda aba.
- [ ] 2.2 Adicionar campos de Nova Senha e Confirmação com visibilidade (ícone de Olho).
- [ ] 2.3 Implementar validação de campos (coincidência e tamanho mínimo).

## 3. Integração e Feedback

- [ ] 3.1 Adicionar método de atualização de senha no `AuthContext.tsx` caso necessário (ou direto no componente via Supabase).
- [ ] 3.2 Implementar lógica de submissão do formulário chamando `supabase.auth.updateUser`.
- [ ] 3.3 Adicionar traduções para todos os novos termos de segurança no i18n (`translation.json`).

## 4. Testes e Validação

- [ ] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [ ] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [ ] Validar o build final e a conformidade com as especificações.
