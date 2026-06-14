## 1. Arquivos de Tradução (i18n)

- [x] 1.1 Abrir `src/locales/pt/translation.json` e buscar por chaves relacionadas ao assistente. Substituir o texto "Assistente de IA" (ou "Assistente") por "Oráculo".
- [x] 1.2 Abrir `src/locales/en/translation.json` e substituir "AI Assistant" por "Oracle".

## 2. Ajustes no Frontend

- [x] 2.1 Pesquisar arquivos `.tsx` (`Sidebar.tsx`, `BottomNav.tsx`, `Layout.tsx`, `AIAssistant.tsx` etc) procurando por strings hardcoded como "Assistente de IA" ou "AI Assistant".
- [x] 2.2 Alterar essas strings ou chaves para refletirem o novo nome: "Oráculo" (PT) e "Oracle" (EN).
- [x] 2.3 Atualizar o componente principal da página do assistente (que responde pela rota) para certificar que o cabeçalho/título da página também apresenta o novo nome.
- [x] 2.4 *Atenção:* As rotas e nomes de arquivos/URLs (`/ai-assistant`) não devem ser alteradas para evitar quebra de navegação de usuários antigos, somente os labels visuais.

## 3. Validação

- [x] 3.1 Iniciar a aplicação localmente.
- [x] 3.2 Verificar o menu lateral no desktop e menu inferior (bottom nav) no mobile em ambos os idiomas (Português e Inglês).
- [x] 3.3 Acessar a página do Oráculo e confirmar se o título da tela condiz com o idioma selecionado.
