## 1. Banco de Dados e Esquema SQL

- [x] 1.1 Criar a migração `supabase/migrations/20260427155000_add_lgpd_consent_to_profiles.sql` para adicionar os campos `accepted_terms_at` (timestamp) e `terms_version` (text) na tabela `profiles`.
- [x] 1.2 Validar a configuração das chaves estrangeiras para garantir comportamento seguro de anonimização (ex: ON DELETE SET NULL) em tabelas transacionais críticas (como votos e ledger de carteiras).

## 2. Implementação do Backend (Edge Functions)

- [x] 2.1 Atualizar o Edge Function `api-privacy` e garantir o correto funcionamento da ação `exportUserData` para consolidação dos dados de perfil, logs de atividades, contribuições e votos.
- [x] 2.2 Garantir o funcionamento da ação `deleteAccount` para exclusão do usuário no Supabase Auth e anonimização de suas referências sem causar quebras de integridade referencial.

## 3. Gestão de Consentimento e Modais (Frontend)

- [x] 3.1 Desenvolver o modal de consentimento `PrivacyConsentModal.tsx` para exibição e aceitação obrigatória dos Termos de Uso e Política de Privacidade.
- [x] 3.2 Integrar a lógica de bloqueio de consentimento pendente na inicialização da aplicação (ex: `App.tsx` ou hook global de autenticação).
- [x] 3.3 Garantir que o clique em "Aceito" no modal envie a atualização correta para a tabela `profiles` de forma segura.

## 4. Central de Privacidade do Usuário

- [x] 4.1 Confirmar o componente `PrivacyTab.tsx` inserido nas configurações do `Profile.tsx`.
- [x] 4.2 Validar a funcionalidade de exportação de dados via download de arquivo JSON.
- [x] 4.3 Validar o diálogo de exclusão de conta em múltiplos passos com confirmação textual (exigindo digitar "DELETE") para prevenir exclusões acidentais.

## 5. Testes e Validação de Conformidade

- [x] 5.1 Desenvolver/executar testes de fluxo E2E (Playwright) ou testes unitários validando a exibição do modal bloqueante e o download de exportação.
- [x] 5.2 Testar o fluxo de exclusão de conta e auditar o banco de dados para garantir a completa anonimização dos dados de governança do usuário excluído.
- [x] 5.3 Executar o build do projeto para garantir conformidade técnica e integridade.
