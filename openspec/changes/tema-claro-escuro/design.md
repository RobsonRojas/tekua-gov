## Context

Atualmente, a aplicação utiliza os estilos padrão do Material UI sem uma customização global de paleta para diferentes modos. O arquivo `src/main.tsx` renderiza a aplicação sem um provedor de tema que suporte alternância dinâmica.

## Goals / Non-Goals

**Goals:**
- Implementar suporte nativo a temas Claro (Light) e Escuro (Dark).
- Permitir a alternância entre temas através de um controle na interface.
- Persistir a escolha do usuário localmente.
- Garantir que todos os componentes existentes (Login, Home, Profile, Admin) respeitem as cores do tema.

**Non-Goals:**
- Criar temas altamente customizados ou "temas de terceiros" (ex: tema High Contrast).
- Redesign completo da interface; o objetivo é apenas suporte a cores.

## Decisions

- **Framework**: Utilizar o `ThemeProvider` do `@mui/material` em conjunto com `createTheme`.
- **Estado Global**: Criar um `ThemeContext` para encapsular a lógica de alternância e fornecer o estado atual para toda a árvore de componentes.
- **Tokens de Cor**: Definir objetos `lightTheme` e `darkTheme` com as cores primárias, secundárias e superfícies (background, paper).
- **Persistência**: Utilizar `localStorage` para salvar a preferência ('light' | 'dark').
- **Integração Auth**: Sincronizar com o perfil do usuário no Supabase se autenticado (coluna `preferred_theme` na tabela `profiles`).

## Risks / Trade-offs

- **Contraste**: O modo escuro exige cuidado especial com o contraste de textos e ícones (WCAG).
- **Imagens**: Algumas imagens ou logos podem precisar de versões diferentes ou filtros (CSS `invert`) para ficarem visíveis no modo escuro.
- **Esforço de Refatoração**: Componentes que usam cores fixas (hexadecimal direto no `sx`) precisarão ser atualizados para usar referências do tema (ex: `theme.palette.text.primary`).
