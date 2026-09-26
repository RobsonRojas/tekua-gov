# api-members (Delta Spec)

## Overview

Melhorar o tratamento de erros na Edge Function `api-members` durante o convite de usuários. Quando o envio de e-mail falha devido a erros de configuração de SMTP (como `Error sending invite email`), a API deve continuar propagando um erro HTTP 400, mas opcionalmente logar o erro de forma mais detalhada e explicitar na resposta ao frontend que o erro é relativo ao envio do convite por e-mail, e sugerir verificação do SMTP.

## Component: Member Invite Endpoint (`inviteMember`)

### Context

Atualmente, `supabaseAdmin.auth.admin.inviteUserByEmail` falha com um erro genérico `Error sending invite email` se o SMTP estiver mal configurado no Supabase. O erro é propagado diretamente. Para facilitar a vida dos administradores, é útil que a função faça um log específico no servidor e retorne o erro mantendo a clareza sobre o problema de e-mail. 

### Requirements

- A função `api-members` (`inviteMember` action) deve interceptar erros oriundos de `inviteUserByEmail`.
- Se a mensagem do erro (ou código) indicar falha de SMTP ou "Error sending invite email", o erro retornado no corpo da resposta para o cliente deve ser claro: `"Não foi possível enviar o e-mail de convite. Verifique as configurações de SMTP."` (ou o equivalente para que o painel mostre um feedback amigável).
- O log no backend (com `console.error`) deve exibir a falha detalhada.
