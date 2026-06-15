## Why

Para melhor refletir a persona e o papel do agente de Inteligência Artificial dentro da governança e cultura do projeto Tekuá, o termo genérico "Assistente de IA" (ou "AI Assistant") deve ser substituído por "Oráculo". Isso cria uma identidade mais lúdica e alinhada com a temática da plataforma.

## What Changes

- Renomear todos os textos visíveis na interface de "AI Assistant" para "Oracle" no idioma inglês.
- Renomear os textos visíveis de "Assistente de IA" para "Oráculo" no idioma português.
- Atualizar as respectivas chaves nos arquivos de internacionalização (i18n).

## Capabilities

### New Capabilities
- Nenhum

### Modified Capabilities
- `i18n-interface`: Atualização das chaves de tradução referentes ao assistente virtual.
- `navigation-interface`: Atualização da exibição do menu de navegação.

## Impact

- Impacta os arquivos de tradução em `src/locales/`.
- Impacta componentes de layout/navegação (`Sidebar`, `BottomNav`) caso possuam strings hardcoded, ou apenas seus arquivos de dicionário.
- Sem impactos no backend ou banco de dados.
