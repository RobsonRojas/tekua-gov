## MODIFIED Requirements

### Requirement: Layout Responsivo e Navegação
O sistema SHALL implementar um design responsivo primariamente orientado a mobile ("mobile-first"), com uma barra de navegação inferior (bottom navigation) em telas pequenas e um menu lateral em telas maiores, adaptando-se a todos os tamanhos de viewport. Adicionalmente, o menu de navegação SHALL incluir um acesso rápido à nova Área de Dádivas.

#### Scenario: Acesso à Área de Dádivas
- **WHEN** o usuário abre o menu principal de navegação (sidebar ou bottom nav).
- **THEN** o sistema SHALL apresentar um link intitulado "Dádivas" (com ícone representativo de presente ou troca) que redireciona o usuário para a rota `/gifts`.
