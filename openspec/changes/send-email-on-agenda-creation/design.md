## Context

A plataforma Tekua possui um módulo de governança onde membros podem criar pautas (agendas) para votação e discussão. Atualmente, a criação de pautas pode passar despercebida se os membros não acessarem a plataforma ativamente. Para garantir uma governança transparente e ágil, os membros precisam ser notificados ativamente sobre novas pautas criadas.

## Goals / Non-Goals

**Goals:**
- Enviar automaticamente um email de notificação para membros elegíveis sempre que uma nova pauta for criada.
- Garantir que a notificação contenha o título da pauta e um link direto para a mesma.

**Non-Goals:**
- Criar um sistema de notificações in-app neste momento.
- Notificar sobre novos comentários ou votos em pautas existentes (apenas focado na criação).

## Decisions

- **Integração de Email:** O envio de email será adicionado ao fluxo de criação da pauta. Podendo ser disparado logo após a persistência bem sucedida da pauta no Supabase (seja na route handler se houver, ou através de um webhook/edge function do Supabase interceptando o insert na tabela).
- **Provedor:** Será utilizado o serviço de envio de email já configurado/existente na plataforma (como Resend ou Supabase Auth Hooks se aplicável).

## Risks / Trade-offs

- **Risk: Atraso na criação da pauta** → *Mitigation:* O disparo do email deve ser feito de forma assíncrona para não bloquear a resposta de sucesso da criação da pauta no frontend.
- **Risk: Falha no provedor de email** → *Mitigation:* Tratar falhas no envio (log de erro) sem impedir que a pauta seja efetivamente criada no banco de dados.
