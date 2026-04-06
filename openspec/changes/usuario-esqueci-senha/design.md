## Context

O portal utiliza o Supabase como provedor de autenticação. Atualmente, o fluxo para usuários que esquecem a senha não está implementado, resultando em uma falha de experiência de usuário e aumento do suporte administrativo.

## Goals / Non-Goals

**Goals:**
- Implementar a página de solicitação de recuperação de senha.
- Oferecer feedback visual claro sobre o envio do email de recuperação.
- Implementar a página de redefinição segura de senha através de um link autenticado.
- Garantir que apenas usuários com email confirmado recebam o link de recuperação.
- Gerar instruções para configuração de SMTP no Supabase.

**Non-Goals:**
- Implementação de recuperação via SMS ou outros métodos além do email.

## Decisions

- **Supabase Auth Helpers**: Utilizar o método `resetPasswordForEmail` do Supabase Client para iniciar o fluxo.
- **Redirecionamento**: Configurar a URL de redirecionamento para `https://tekua-gov.vercel.app/reset-password` (ou localhost para desenvolvimento).
- **Security**: A página `/reset-password` só deve ser acessível quando o usuário possuir um token válido na URL, gerado pelo clique no email de recuperação.

## Risks / Trade-offs

- **Rate Limiting**: O Supabase possui limites para envio de emails de recuperação gratuitos. Exceder esse limite causará erros temporários no fluxo.
- **Deliverability**: Emails de recuperação podem cair na pasta de spam. Será necessário instruir o usuário sobre isso na interface.
