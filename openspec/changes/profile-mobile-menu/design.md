## Context

A página de perfil (`Profile.tsx`) utiliza um sistema de abas para separar informações pessoais, configurações de segurança, histórico e privacidade. No mobile, estas abas forçam uma rolagem horizontal que pode ocultar opções importantes (como Segurança ou Privacidade) dependendo do tamanho do dispositivo.

## Goals / Non-Goals

**Goals:**
- Implementar um menu suspenso (dropdown) para navegação de perfil no mobile.
- Manter a paridade de funcionalidades entre o menu mobile e as abas desktop.
- Garantir que ícones e rótulos sejam exibidos de forma clara no menu.
- Unificar a experiência de navegação responsiva em todo o PWA.

**Non-Goals:**
- Alterar o conteúdo interno das abas (SecurityTab, ActivityTab, etc.).
- Mudar as permissões de acesso às abas (ex: apenas admins veem certas abas).

## Decisions

- **Modo de Exibição:** O menu será ativado quando `isMobile` (breakpoint `sm`) for verdadeiro.
- **Estrutura de Dados:** Criar uma lista de objetos `tabOptions` contendo `label`, `icon`, `value` e uma condição `visible` (para tratar `isAdminView`).
- **Feedback Visual:** O botão de menu no mobile exibirá o ícone e o texto da aba selecionada para que o usuário saiba sempre em qual seção está.
- **Estética:** Utilizar um botão com `variant="outlined"` ou `contained` conforme o design system, com bordas arredondadas (12px-24px) para combinar com os cards do perfil.

## Risks / Trade-offs

- [Descoberta] → Usuários podem ter que abrir o menu para ver quais seções estão disponíveis. *Mitigação:* Usar um rótulo claro no botão ("Seção: Nome da Aba").
- [Consistência] → Garantir que o `tabValue` não seja resetado ao abrir/fechar o menu. *Mitigação:* O estado será mantido no componente pai `Profile`.
