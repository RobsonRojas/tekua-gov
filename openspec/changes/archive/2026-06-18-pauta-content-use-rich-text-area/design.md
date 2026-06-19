## Context

O sistema de votação/pautas atualmente usa um campo `<TextField multiline>` para o conteúdo da pauta, armazenando Markdown. A exibição usa `ReactMarkdown`. A especificação do `voting-system` já define que deve haver um "editor de texto rico estável" compatível com React 19. A biblioteca `react-quill` está listada no `package.json` mas nunca foi integrada (apenas mockada em testes) devido a problemas de compatibilidade com React 19 (`findDOMNode`).

## Goals / Non-Goals

**Goals:**
- Substituir o campo de texto simples por um editor WYSIWYG na criação de pautas
- Renderizar o conteúdo formatado (HTML) na visualização da pauta
- Garantir compatibilidade com React 19
- Manter o armazenamento i18n existente (JSONB com chaves de idioma)
- Reutilizar `SanitizedHTML` (já existente) para renderização segura

**Non-Goals:**
- Não alterar o sistema de comentários (continuam como texto simples)
- Não alterar o sistema de votação
- Não migrar dados existentes (Markdown continua funcional no `ReactMarkdown`)

## Decisions

### 1. Editor Rich Text: `react-quill-new` em vez de `react-quill`

**Decisão:** Usar `react-quill-new` (fork compatível com React 18/19) como dependência.

**Rationale:** `react-quill` v2.0.0 usa `findDOMNode` (depreciado no React 18+, erro no React 19 strict mode). O fork `react-quill-new` resolve esse problema mantendo a mesma API. Como `react-quill` já está no projeto, a migração é de baixo risco.

**Alternativas consideradas:**
- **TipTap**: Excelente, mas requer adicionar nova dependência pesada e curva de aprendizado
- **react-quill (v2)**: Já está no projeto, mas quebra no React 19 strict mode

### 2. Formato de Armazenamento: HTML em vez de Markdown

**Decisão:** O conteúdo será armazenado como HTML sanitizado no campo JSONB `content`.

**Rationale:** Editores WYSIWYG produzem HTML nativamente. Converter HTML → Markdown para armazenar e depois Markdown → HTML para exibir é redundante e propenso a perda de formatação.

### 3. Renderização: `SanitizedHTML` em vez de `ReactMarkdown`

**Decisão:** Substituir `ReactMarkdown` por `SanitizedHTML` na exibição da pauta.

**Rationale:** `SanitizedHTML` já existe no projeto, usa `DOMPurify` com whitelist de tags, e renderiza HTML com segurança. Remove a dependência de `react-markdown` para este caso de uso.

### 4. Componente Reutilizável: `RichTextEditor`

**Decisão:** Criar um componente `RichTextEditor` em `src/components/common/` encapsulando o react-quill-new.

**Rationale:** Permite reúso futuro em outros formulários que precisem de rich text. Centraliza a configuração (toolbar, sanitização, i18n).

## Risks / Trade-offs

- **[React 19 compatibilidade]** `react-quill-new` é um fork de comunidade menos testado que o original → Mitigação: testar manualmente a criação e edição de pautas antes do deploy
- **[Dados existentes]** Pautas criadas com Markdown não serão convertidas para HTML → Mitigação: o `ReactMarkdown` ainda renderiza Markdown corretamente, e ao editar uma pauta existente o conteúdo será carregado no editor como texto (o Quill mostrará o Markdown cru)
- **[XSS]** Armazenar HTML aumenta superfície de ataque → Mitigação: `DOMPurify` com whitelist restritiva já está em uso no `SanitizedHTML`
