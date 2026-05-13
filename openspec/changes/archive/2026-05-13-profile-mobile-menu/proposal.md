## Why

A página de perfil do usuário contém múltiplas abas (Informações, Segurança, Atividade, Privacidade). Em dispositivos móveis, o uso de abas horizontais com rolagem pode ser confuso e ocupa espaço vertical que poderia ser usado para o conteúdo do perfil. Implementar um menu contextual (hambúrguer/dropdown) para seleção de seções no mobile melhorará a usabilidade e manterá a consistência com o padrão adotado no Mural de Trabalho.

## What Changes

- Substituição do componente de `Tabs` por um botão de seleção de seção no Perfil quando visualizado em dispositivos móveis (`xs`).
- Implementação de um `Menu` suspenso para alternar entre as seções do perfil.
- O botão de menu deve exibir o ícone e o nome da seção ativa.
- Manutenção das `Tabs` para visualização em Desktop/Tablet.
- Garantia de que a mudança de seção via menu atualize o estado `tabValue` corretamente.

## Capabilities

### New Capabilities
- `profile-responsive-navigation`: Requisitos para a navegação contextual das seções de perfil em diferentes viewports.

### Modified Capabilities
- `navigation-interface`: Continuação da expansão dos padrões de navegação contextual.

## Impact

- `src/pages/Profile.tsx`: Refatoração da interface de abas para suportar o modo responsivo.
- UX: Interface mais limpa no mobile, com foco no conteúdo de cada aba.
