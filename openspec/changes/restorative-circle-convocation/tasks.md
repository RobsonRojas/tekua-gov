## 1. Banco de dados

- [x] 1.1 Criar migração com a tabela `restorative_circles`, as colunas da design e a restrição de data futura na criação.
- [x] 1.2 Gerar `share_token` no banco, único, com 32 caracteres aleatórios, e garantir que não é adivinhável.
- [x] 1.3 Criar RLS: leitura para membros autenticados; criação com `created_by = auth.uid()`; encerramento pelo autor enquanto aberta, ou por administrador.

## 2. Backend

- [x] 2.1 Criar ações de criar convocação, listar convocações abertas, consultar por token (exigindo sessão), encerrar e cancelar, com o registro de `cancelled_by`. Regra de quem pode convocar confirmada (ver `design.md` — Decisões confirmadas).
- [x] 2.2 Adicionar em `notify-engine` o evento `restorative_circle.convened`, com broadcast para todos os membros, notificação in-app, push e email, e link de compartilhamento como destino.
- [x] 2.3 Garantir que a consulta por token não revela convocações além da solicitada.

## 3. Wizard (passo 4)

- [x] 3.1 Substituir o alerta do botão "Entendido, vou convocar" por um formulário de convocação, mantendo o texto de orientação acima dele.
- [x] 3.2 Validar no cliente tema, data e horário, e confirmação dos pré-círculos, e bloquear data passada.
- [ ] 3.3 Exibir alerta de visibilidade quando a descrição contiver nomes, antes da confirmação.
- [x] 3.4 Após criar, exibir o link de compartilhamento com a opção de copiá-lo.

## 4. Página de compartilhamento

- [x] 4.1 Criar a rota `/share/circle/:token` com a página de detalhes da convocação.
- [x] 4.2 Exigir login antes de exibir qualquer detalhe, e tratar token inexistente com mensagem genérica.

## 5. Dashboard e painel do administrador

- [x] 5.1 Adicionar em `src/pages/Home.tsx` o destaque da convocação aberta com data futura, visível a todos os membros.
- [x] 5.2 Adicionar em `src/pages/AdminPanel.tsx` a aba de convocações, com listagem, status, autor e data agendada, e ações de encerrar e cancelar.

## 6. Internacionalização

- [x] 6.1 Adicionar em `src/locales/pt/translation.json` e `src/locales/en/translation.json` as chaves do formulário, do destaque, da página de compartilhamento, da aba do admin e do texto do email e da notificação.

## 7. Testes e verificação

- [x] 7.1 Teste do formulário: campos obrigatórios, data passada bloqueada, alerta de nomes na descrição.
- [x] 7.2 Teste de segurança: token inválido não revela outras convocações; acesso sem sessão pede login; membro comum não encerra convocação de outro.
- [x] 7.3 Teste do destaque no dashboard: aparece só para convocação aberta e futura, e some ao cancelar.
- [x] 7.4 Teste do broadcast: falha de um destinatário não interrompe os demais.
- [x] 7.5 Rodar `npm run test`, `npm run build` e `npm run lint` nos arquivos alterados, sem regressões.
- [x] 7.6 Rodar `openspec validate restorative-circle-convocation --strict`.
- [x] 7.7 Aplicar a migração no Supabase de produção somente com confirmação explícita, sem `db push`.
- [ ] 7.8 Publicar e verificar em produção: criação, email e push recebidos, link de compartilhamento, destaque no dashboard e cancelamento pelo administrador.
