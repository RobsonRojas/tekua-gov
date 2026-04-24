## 1. Infraestrutura de Temas

- [x] 1.1 Criar o contexto de tema `src/context/ThemeContext.tsx`.
- [x] 1.2 Definir as paletas de cores `light` e `dark` usando `createTheme`.
- [x] 1.3 Envolver o ponto de entrada da aplicação (`src/main.tsx`) com o `ThemeProvider` do Material UI e o `ThemeContext`.

## 2. Componentes e Interface

- [x] 2.1 Criar o componente `ThemeToggleButton` para alternância manual.
- [x] 2.2 Integrar o `ThemeToggleButton` no `MainLayout.tsx`.
- [x] 2.3 Revisar componentes principais e substituir cores estáticas por referências da paleta do tema.

## 3. Persistência e Integração

- [x] 3.1 Implementar lógica de salvamento e carregamento do `localStorage`.
- [x] 3.2 Atualizar o `AuthContext.tsx` para sincronizar a preferência com o Supabase (campo `preferred_theme` no perfil).
- [x] 3.3 Adicionar migração SQL para incluir a coluna `preferred_theme` na tabela `profiles`.

## 4. Testes e Validação

- [x] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [x] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [x] Validar o build final e a conformidade com as especificações.
