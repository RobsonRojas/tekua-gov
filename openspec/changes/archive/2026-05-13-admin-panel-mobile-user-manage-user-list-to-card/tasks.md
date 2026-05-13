## 1. UI Refactoring

- [x] 1.1 Identificar a seção de renderização da `Table` de usuários em `AdminPanel.tsx`
- [x] 1.2 Implementar a estrutura de cards para visualização mobile (`xs`) usando `filteredUsers.map`
- [x] 1.3 Integrar os componentes de Avatar, Nome, Email e Chips (Roles) no layout do card
- [x] 1.4 Adicionar o botão de ações (MoreVertical) em cada card vinculado à função `handleMenuOpen`
- [x] 1.5 Envolver a `TableContainer` desktop e a nova lista de cards em uma condicional `isMobile`

## 2. Verification

- [x] 2.1 Validar se a tabela continua aparecendo corretamente no Desktop
- [x] 2.2 Testar a visualização em cards emulando um dispositivo móvel
- [x] 2.3 Confirmar que o menu de opções (editar/remover) abre corretamente a partir do card mobile
- [x] 2.4 Verificar se o estado de carregamento (`loading`) e a mensagem de "nenhum usuário encontrado" funcionam em ambos os modos
