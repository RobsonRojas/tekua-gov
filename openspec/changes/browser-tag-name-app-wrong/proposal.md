## Why

O nome exibido na aba do navegador está incorretamente definido como "Ecos da Amazônia". Para manter a identidade visual e a clareza para o usuário, o título deve ser alterado para "Tekuá Governança" e deve ser integrado ao sistema de tradução para suportar inglês e português.

## What Changes

- **Correção do Título Padrão**: Alterar o título estático no arquivo `index.html`.
- **Internacionalização do Título**: Implementar lógica para que o título da aba do navegador mude dinamicamente conforme o idioma selecionado (PT/EN).
- **Mapeamento de Tradução**: Adicionar chaves de tradução para o nome do aplicativo nos arquivos de localização.

## Capabilities

### New Capabilities
- `app-title-management`: Gerenciamento dinâmico e localizado do título da aplicação exibido no navegador.

### Modified Capabilities
- `i18n-interface`: Expansão dos requisitos para incluir a localização de metadados da aplicação (como o título da página).

## Impact

- `index.html`: Alteração do título inicial.
- `src/App.tsx` (ou componente principal): Implementação do hook para atualização dinâmica do título.
- `src/locales/`: Novas chaves de tradução.
