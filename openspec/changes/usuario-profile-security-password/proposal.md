## Why

Atualmente, a página de perfil permite apenas a edição de informações básicas (nome, idioma, tema). Não existe uma forma nativa do usuário alterar sua própria senha de acesso dentro da plataforma autenticada. Para garantir a segurança dos membros, o gerenciamento de credenciais deve ser acessível e intuitivo.

## What Changes

Implementar uma seção de segurança na página de Perfil:
1.  Adição de abas (Tabs) na página `Profile.tsx` (ex: "Info Básica" e "Segurança").
2.  Criação de formulário de alteração de senha (Senha Atual, Nova Senha, Confirmação).
3.  Integração com o Supabase Auth para atualização de senha autenticada (`updateUser`).
4.  Implementação de feedbacks visuais para erros de validação e sucesso.

## Capabilities

### New Capabilities
- `profile-security`: Permite ao usuário logado gerenciar suas credenciais de segurança, especificamente a alteração de senha.

### Modified Capabilities
- None

## Impact

- `src/pages/Profile.tsx`: Reestruturação da UI com abas.
- `AuthContext.tsx`: Métodos para atualização de senha (updatePassword).
- `translation.json`: Novos termos de segurança.
