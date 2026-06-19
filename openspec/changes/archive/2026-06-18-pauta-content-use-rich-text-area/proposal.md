## Why

Atualmente o conteúdo da pauta é um campo de texto simples com suporte a Markdown, mas a especificação do sistema de votação já define que deve haver um editor de texto rico. Usuários precisam formatar texto (negrito, listas, links, etc.) sem conhecer Markdown, e a exibição do conteúdo deve preservar essa formatação visualmente.

## What Changes

- Substituir o campo `<TextField multiline>` no diálogo de criação de pauta por um editor de texto rico (WYSIWYG)
- Substituir a renderização com `ReactMarkdown` por renderização segura de HTML na exibição da pauta
- O conteúdo será armazenado como HTML (em vez de Markdown) no campo JSONB `content` da tabela `discussion_topics`
- Garantir compatibilidade com React 19 conforme especificação vigente do `voting-system`

## Capabilities

### New Capabilities
- `pauta-content`: Editor de texto rico para criação de pautas e visualização formatada do conteúdo

### Modified Capabilities
- `voting-system`: Campo de conteúdo da pauta muda de Markdown para HTML rich text; requisito de "editor de texto rico estável" agora é atendido

## Impact

- `src/pages/Voting.tsx`: substituir `TextField` por componente de editor rich text no diálogo de criação
- `src/pages/TopicDetail.tsx`: substituir `ReactMarkdown` por `SanitizedHTML` (já existe no projeto)
- `src/components/common/`: possível novo componente `RichTextEditor` reutilizável
- Dependências: `react-quill` já está no `package.json` mas tem incompatibilidade com React 19 (`findDOMNode`). Pode ser necessário migrar para `react-quill-new` ou outro editor React 19-compatible (ex: TipTap)
- `dompurify` já está no projeto via `SanitizedHTML`
- Testes: atualizar mocks do `react-quill` nos testes existentes (`Voting.test.tsx`, `test/setup.tsx`)
