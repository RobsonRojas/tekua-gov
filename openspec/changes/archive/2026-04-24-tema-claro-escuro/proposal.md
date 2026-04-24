## Why

O portal Tekua Governance atualmente suporta apenas um tema estático (claro). Adicionar suporte a temas claro e escuro é essencial para melhorar a acessibilidade, reduzir a fadiga ocular em ambientes de baixa luminosidade e fornecer uma experiência de usuário mais moderna e personalizável. Além disso, muitos usuários preferem o modo escuro por economia de bateria em telas OLED e estética.

## What Changes

Esta mudança irá introduzir uma infraestrutura de temas dinâmica na aplicação. As principais alterações incluem:
- Definição de uma paleta de cores para modo claro e modo escuro.
- Integração do ThemeProvider do Material UI (se aplicável) ou um sistema de variáveis CSS customizado.
- Adição de um componente de alternância (toggle) de tema na interface global (`MainLayout`).
- Persistência da preferência do usuário no `localStorage` e, opcionalmente, sincronização com o perfil do usuário no Supabase.

## Capabilities

### New Capabilities
- `theme-management`: Permite ao sistema gerenciar múltiplas paletas de cores e alternar entre elas em tempo de execução sem recarregar a página.

### Modified Capabilities
- `layout-interface`: O cabeçalho global será atualizado para incluir o seletor de tema.

## Impact

Esta mudança afetará quase todos os componentes de UI, exigindo a substituição de cores "hardcoded" por tokens de tema ou variáveis CSS. Não há impacto direto nas APIs de dados, apenas na camada de apresentação e persistência de preferências de perfil.
