## 1. Infraestrutura de Temas

- [ ] 1.1 Criar o contexto de tema `src/context/ThemeContext.tsx`.
- [ ] 1.2 Definir as paletas de cores `light` e `dark` usando `createTheme`.
- [ ] 1.3 Envolver o ponto de entrada da aplicação (`src/main.tsx`) com o `ThemeProvider` do Material UI e o `ThemeContext`.

## 2. Componentes e Interface

- [ ] 2.1 Criar o componente `ThemeToggleButton` para alternância manual.
- [ ] 2.2 Integrar o `ThemeToggleButton` no `MainLayout.tsx`.
- [ ] 2.3 Revisar componentes principais e substituir cores estáticas por referências da paleta do tema.

## 3. Persistência e Integração

- [ ] 3.1 Implementar lógica de salvamento e carregamento do `localStorage`.
- [ ] 3.2 Atualizar o `AuthContext.tsx` para sincronizar a preferência com o Supabase (campo `preferred_theme` no perfil).
- [ ] 3.3 Adicionar migração SQL para incluir a coluna `preferred_theme` na tabela `profiles`.
