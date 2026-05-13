## Context

O sistema de navegação utiliza o hook `useNavigation` para fornecer uma lista centralizada de itens (`navItems`). Atualmente, um destes itens é o Histórico de Atividades, que é redundante para administradores que já possuem acesso ao Painel Admin.

## Goals / Non-Goals

**Goals:**
- Remover o item de histórico de atividades da navegação lateral.
- Limpar imports não utilizados no hook de navegação.

**Non-Goals:**
- Remover a página ou funcionalidade de histórico de atividades do sistema.
- Alterar o comportamento do Painel Admin.

## Decisions

- **Modificação do Hook:** A exclusão será feita diretamente no array `navItems` no arquivo `src/hooks/useNavigation.tsx`.
- **Limpeza de Dependências:** O ícone `History` será removido do import de `lucide-react` para manter o código limpo, caso não seja utilizado em outros itens da lista.

## Risks / Trade-offs

- [Descoberta] → Administradores podem ter dificuldade em encontrar o histórico de auditoria inicialmente. *Mitigação:* A funcionalidade permanece proeminente dentro do Painel Admin (aba "Auditoria").
