## 1. Backend: envio de e-mail de senha

- [x] 1.1 Criar `supabase/functions/_shared/password-email.ts` com `sendPasswordSetupEmail` (gerar link via `generateLink` recovery, montar URL com `SITE_URL`, template HTML pt-BR para flows `invite` e `reset`)
- [x] 1.2 Implementar envio via Resend com fallback para `email_queue` (`type = 'external'`, `subject`, `body`, `from_email`) retornando `sent` ou `queued`
- [x] 1.3 Falhar com erro explícito se `SITE_URL` ou `RESEND_API_KEY` não estiverem configurados
- [x] 1.4 Adicionar ação `sendPasswordSetupEmail` em `api-members` (checagem de admin, busca do e-mail pelo `targetUserId`)
- [x] 1.5 Alterar `inviteMember` para usar o helper com `flow: 'invite'` em vez do insert `invite` e retornar `emailStatus`
- [x] 1.6 Ajustar `cron_retry_emails` para reenviar linhas `invite` legadas via helper em vez de `inviteUserByEmail`

## 2. Frontend: painel de membros

- [x] 2.1 Adicionar `sendPasswordSetupEmail` em `src/hooks/useMembers.ts`
- [x] 2.2 Adicionar "Enviar e-mail de troca de senha" nas ações de cada usuário em `AdminPanel.tsx` e `MemberManagement.tsx` (aba Gerenciamento de Usuários) com confirmação, bloqueio durante envio e feedback de sucesso/pendente/erro
- [x] 2.3 Em `NewMemberModal.tsx`, informar se o e-mail de finalização foi enviado ou ficou pendente
- [x] 2.4 Adicionar chaves i18n (pt/en/demais idiomas existentes) para os novos textos

## 3. Página segura de configuração de senha

- [x] 3.1 Em `ResetPassword.tsx`, ler `flow=invite` e exibir título/subtítulo/botão de "finalizar cadastro"
- [x] 3.2 Executar `signOut` após definir a senha e antes de redirecionar ao login
- [x] 3.3 Garantir que link inválido/expirado ofereça voltar ao login e solicitar novo link

## 4. Testes

- [x] 4.1 Testes unitários do helper (link montado corretamente, fallback para fila, erro sem `SITE_URL`)
- [ ] 4.2 Atualizar `ResetPassword.test.tsx` cobrindo modo `invite` e `signOut`
- [ ] 4.3 Teste do `MemberManagement` para o botão (visível, confirma, desabilita durante envio)

## 5. Configuração e verificação

- [ ] 5.1 Documentar/configurar secrets `RESEND_API_KEY` e `SITE_URL` e a validade do OTP no Supabase Auth
- [ ] 5.2 Verificação manual: cadastrar membro, receber e-mail, definir senha e logar; repetir pelo botão do admin
