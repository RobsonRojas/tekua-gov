## Why

No passo 4 do wizard de justiça restaurativa (Câmara Coletiva), o botão "Entendido, vou convocar" só exibe um alerta e manda o usuário procurar a Equipe de Harmonia. A convocação de um círculo restaurativo, que depende de a vila ser avisada e de haver um canal para se voluntariar, não acontece dentro do sistema. Por isso, quem precisa convocar um círculo não consegue fazê-lo, e os membros não ficam sabendo.

## What Changes

- Ao final do wizard (passo 4), o botão passa a **exibir o formulário de convocação do círculo restaurativo**, em vez do alerta.
- O formulário coleta tema, descrição, data e horário, local ou link, e a confirmação de que os pré-círculos individuais foram considerados. O texto exibido a todos é genérico: o formulário não pede nem exibe os nomes das partes envolvidas.
- Ao confirmar, a convocação é criada e gera **um link para compartilhamento** (`/share/circle/<token>`), com token não adivinhável.
- A convocação dispara um **email e uma notificação in-app com push (PWA)** para todos os membros da vila, convidando-os ao círculo e levando ao link.
- A convocação aparece **em destaque no dashboard** (Home) para todos os membros, enquanto estiver aberta e agendada.
- O **painel do administrador** lista todas as convocações, com status, e permite encerrar ou cancelar uma convocação.

## Capabilities

### New Capabilities

- `restorative-circle-convocation`: convocação de círculo restaurativo pelo wizard, com link de compartilhamento, email e notificação para a vila, destaque no dashboard e gestão no painel do administrador.

### Modified Capabilities

- `justica-restaurativa-wizard`: o direcionamento para a Câmara Coletiva passa a terminar no formulário de convocação, em vez de apenas orientar como convocar.

## Impact

- **Banco de dados**: nova tabela de convocações com token de compartilhamento e RLS, e uma migração.
- **Backend**: ações novas de criação, listagem, consulta por token e encerramento de convocações, e o evento de convocação no `notify-engine` para broadcast à vila.
- **Frontend**: `src/components/JusticaRestaurativa/WizardFlow.tsx` (passo 4), nova página pública de compartilhamento `/share/circle/:token`, destaque em `src/pages/Home.tsx`, nova aba em `src/pages/AdminPanel.tsx`.
- **Traduções**: `src/locales/{pt,en}/translation.json`.
- **Sem impacto em**: triagem e passos 1 a 3 do wizard, o agente de justiça restaurativa e a carteira.
