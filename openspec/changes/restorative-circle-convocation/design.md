## Context

Ver `proposal.md` — Why. Estado atual que condiciona a abordagem:

- O passo 4 do wizard (`src/components/JusticaRestaurativa/WizardFlow.tsx`) tem o botão "Entendido, vou convocar", que só chama `alert(...)`. A orientação está dentro de `justica-restaurativa-wizard`.
- `notify-engine` já faz broadcast para todos os membros em eventos como `governance.agenda_created`: grava a notificação in-app, envia push e email, e aceita falha por destinatário sem interromper os demais.
- A rota pública `/share/surreal/:shareId` mostra o padrão de página de compartilhamento já usado no projeto.
- O Home (`src/pages/Home.tsx`) monta os cards com `homeCards`, e o painel admin (`src/pages/AdminPanel.tsx`) organiza as seções em abas.
- Não existe tabela de convocações nem ação de círculo no backend.

## Goals / Non-Goals

**Goals:**
- Convocar um círculo a partir do próprio wizard, sem alerta de orientação.
- Garantir que a convocação visível à vila não identifica as partes do conflito.
- Avisar toda a vila por email e push, com link que leva diretamente à convocação.
- Dar visibilidade contínua no dashboard e controle no painel do administrador.

**Non-Goals:**
- Não registrar participação ou voluntários no círculo nesta mudança. A convocação diz "quem se voluntaria" por contato, como o texto atual.
- Não armazenar o conteúdo do conflito, nem o que é dito no círculo.
- Não alterar os passos 1 a 3 do wizard nem a triagem.
- Não implementar a Equipe de Harmonia como fluxo do sistema.

## Decisions

**1. Tabela `restorative_circles` com token de compartilhamento.**
- *Decisão:* colunas `id`, `title`, `theme`, `description`, `scheduled_at`, `location_or_link`, `status` (`open`, `closed`, `cancelled`), `created_by`, `cancelled_by`, `share_token` (único, 32 caracteres aleatórios gerados no banco) e `created_at`.
- *Por quê:* o token é o segredo de compartilhamento. Usar o `id` como link permitiria enumerar convocações.
- *Restrição no banco:* `scheduled_at` deve ser futuro no momento da criação, checado também no banco, não só na interface.

**2. RLS e acesso por papel.**
- *Decisão:* leitura para membros autenticados; criação apenas com `created_by = auth.uid()`; encerramento ou cancelamento pelo autor enquanto `open`, ou por administrador a qualquer momento. Acesso por token passa por ação do backend que valida a sessão antes de devolver os detalhes.
- *Alternativa rejeitada:* leitura pública sem sessão. Contraria o requisito de exigir login.

**3. Broadcast reaproveitando `notify-engine`.**
- *Decisão:* novo evento `restorative_circle.convened`, com o mesmo padrão de broadcast de `governance.agenda_created` (todos os perfis), e o link de compartilhamento como destino. O envio por destinatário já tolera falhas.
- *Alternativa rejeitada:* chamar o email e o push diretamente na ação de criação. Duplicaria a lógica de canais que `notify-engine` já centraliza.

**4. Formulário no passo 4 do wizard.**
- *Decisão:* o componente de passo 4 passa a renderizar o formulário de convocação. O texto da orientação permanece antes do formulário, e a validação de campos fica no cliente, com a decisão final no backend.

**5. Dashboard e painel admin.**
- *Dashboard:* um card de destaque no Home, consultado pela ação de convocações abertas com data futura.
- *Painel admin:* nova aba com a listagem completa, com filtros de status, e ações de encerrar ou cancelar. A ação de cancelamento grava `cancelled_by`.

## Risks / Trade-offs

- **Identificação indireta das partes** → mesmo sem nomes, um tema muito específico pode identificar um conflito. Mitigação: alerta no formulário, orientação de tema genérico, e cancelamento pelo administrador.
- **Abuso por convocações repetidas** → qualquer membro poderia enviar muitos emails para a vila. Mitigação proposta: limite de uma convocação aberta por autor. Isso precisa de confirmação (ver Open Questions).
- **Falha de entrega** → mitigado pelo tratamento de falha por destinatário do `notify-engine`.
- **Convocação com data expirada continuar aberta** → o destaque só considera data futura; o status fica aberto até alguém encerrar.
- **Token vazado** → quem tiver o link acessa a convocação, mas precisa de sessão. Cancelamento pelo administrador invalida o destaque imediatamente.

## Migration Plan

1. Aplicar a migração da tabela, com RLS e restrições, no Supabase de produção, isoladamente e sem `db push`, pelo mesmo motivo do change `fix-requester-executor-confirm-button`.
2. Publicar a ação de backend e o evento no `notify-engine`.
3. Publicar o frontend (passo 4, página do link, destaque no Home e aba do admin).
4. **Rollback:** remover o formulário do passo 4 (volta ao alerta anterior) e a aba do admin. A tabela pode ser mantida, pois nada depende dela fora do destaque.

## Decisões confirmadas

- **Quem pode convocar**: qualquer membro autenticado pode convocar pelo wizard. O autor encerra a própria convocação enquanto estiver aberta, e o administrador pode encerrar ou cancelar qualquer uma.
- **Uma convocação aberta por autor**: garantido por índice único parcial no banco (`status = 'open'`).
- **Tema**: não há coluna `theme` separada. O tema é o campo `title`.