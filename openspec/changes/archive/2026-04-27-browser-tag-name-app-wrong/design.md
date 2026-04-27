## Context

O título da aplicação está atualmente fixado como "Ecos da Amazônia" no arquivo `index.html`. Não há lógica no frontend para atualizar esse título dinamicamente quando o usuário altera o idioma da interface.

## Goals / Non-Goals

**Goals:**
- Garantir que o título da aba do navegador seja "Tekuá Governança" por padrão.
- Sincronizar o título da aba com o idioma selecionado (PT/EN).
- Centralizar o nome da aplicação nas traduções do i18next.

**Non-Goals:**
- Adicionar bibliotecas externas complexas como `react-helmet` (a menos que seja estritamente necessário).
- Alterar metadados de SEO mais complexos (OG tags, etc.) além do título básico nesta fase.

## Decisions

### 1. Atualização Dinâmica via useEffect
Utilizaremos um `useEffect` no componente raiz (`App.tsx`) que observa as mudanças no objeto `i18n`. Sempre que o idioma mudar, o `document.title` será atualizado com a tradução da chave `app.title`.

**Rationale:** É a solução mais leve e direta, aproveitando o sistema de tradução já existente sem introduzir novas dependências.

### 2. Padrão de Chave de Tradução
A chave de tradução será `common.appTitle` ou `app.title`. Optaremos por `app.title` para manter os metadados da aplicação organizados.

**Valores sugeridos:**
- PT: "Tekuá Governança"
- EN: "Tekuá Governance"

### 3. Backup no index.html
O arquivo `index.html` será atualizado para "Tekuá Governança" para garantir que, durante o carregamento inicial (antes do JS executar), o nome correto já seja exibido.

## Risks / Trade-offs

- **[Risco]** Flash de título incorreto durante o carregamento.
  - **Mitigação**: Atualizar o `index.html` com o nome em português (idioma padrão) para minimizar o impacto visual inicial.
