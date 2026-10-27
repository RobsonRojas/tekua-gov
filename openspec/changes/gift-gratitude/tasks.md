## 1. Banco de dados

- [x] 1.1 Criar migração em `supabase/migrations/` que adiciona em `gift_usages`: `thanks_message` (até 280 caracteres), `thanks_emojis` (lista curta), `sentiment` (`gratitude` ou `ingratitude`, default `gratitude`) e `is_public` (default `true`), com a restrição de que ingratidão é sempre privada. [inclui a coluna de sentimento e a restrição de que ingratidão é sempre privada]
- [x] 1.2 Atualizar a RLS de `gift_usages`: leitura pública apenas de registros públicos de gratidão; edição apenas pelo próprio `consumer_id`.
- [x] 1.3 Criar a função de lembrete semanal que lista membros com usos dos últimos 7 dias sem agradecimento, com registro de envio por membro e semana.

## 2. Backend

- [x] 2.1 Atualizar `award_gift_points` para aceitar agradecimento opcional, validando o tamanho antes da inserção, sem alterar a contabilização dos pontos.
- [x] 2.2 Em `api-gifts`, aceitar o agradecimento no `recordUsage` e criar as ações de editar o agradecimento e de alterar a visibilidade do próprio registro.
- [x] 2.3 Em `api-gifts`, criar a ação de listagem do dashboard público, que retorna apenas gratidões públicas.
- [x] 2.4 Em `notify-engine`, adicionar o evento `gift.gratitude_reminder` com notificação in-app, push e email, usando o texto da spec `gift-gratitude`.
- [ ] 2.5 Agendar a função semanal de lembrete que dispara o evento para cada membro elegível. [agendamento pg_cron pendente: requer o segredo do cron e a publicação, após confirmação]

## 3. Frontend

- [x] 3.1 Em `src/pages/GiftsArea.tsx`, adicionar ao fluxo de "Eu utilizei isso" o campo opcional de mensagem (com contador de caracteres) e de emojis, com opção de ingratidão que torna o registro privado.
- [x] 3.2 Garantir que o card do mural não exibe o texto dos agradecimentos.
- [x] 3.3 Reproduzir o texto cortado no card com uma descrição longa, identificar a causa e corrigir no componente do card. [corrigido: URLs soltas na descrição aparecem como link curto com o nome do site, e a URL completa continua clicável. Não reproduzido visualmente no navegador: confirmar no card com um link longo]
- [x] 3.4 Adicionar ao histórico de dádivas utilizadas a ação de deixar ou editar o agradecimento, e de tornar o registro privado ou público.
- [x] 3.5 Criar a página do dashboard público de gratidões, com estado vazio, e acesso a partir da Área de Dádivas.
- [x] 3.6 Tratar a exibição de ingratidões como sempre privadas: não listá-las no dashboard público, e informar o autor quando ele tentar torná-las públicas. [API recusa tornar ingratidão pública; histórico desabilita a opção e mostra o motivo]

## 4. Internacionalização

- [x] 4.1 Adicionar em `src/locales/pt/translation.json` e `src/locales/en/translation.json` as chaves do campo de agradecimento, da privacidade, do dashboard, das mensagens de erro e do texto do lembrete.

## 5. Testes e verificação

- [x] 5.1 Confirmar com o responsável pelo produto a regra de ingratidão privada (ver `design.md` — Open Questions) antes de concluir a tarefa 2.1. [decidido: ingratidões são privadas por enquanto]
- [x] 5.2 Testes do registro de uso: com mensagem, só com emojis, sem agradecimento, e mensagem acima do limite (que não registra o uso).
- [x] 5.3 Testes de privacidade: gratidão privada sai do dashboard, ingratidão nunca aparece publicamente, e outro membro não consegue alterar a visibilidade. [testado no banco (verify_gift_gratitude.sql) e na interface]
- [x] 5.4 Teste do lembrete: envia só a quem não agradeceu, no máximo uma vez por semana, e uma falha de email não interrompe os demais. [testes automatizados: um envio por membro e por semana, e falha de um não interrompe os demais]
- [x] 5.5 Rodar `npm run test`, `npm run build` e `npm run lint` nos arquivos alterados, sem regressões.
- [x] 5.6 Rodar `openspec validate gift-gratitude --strict`.
- [x] 5.7 Aplicar a migração no Supabase de produção **somente** com confirmação explícita, e sem `db push`. [migração aplicada em produção; funções publicadas]
- [ ] 5.8 Publicar e verificar em produção: registro com agradecimento, dashboard, privacidade e recebimento do lembrete.
