## 1. Setup

- [x] 1.1 Replace `react-quill` dependency with `react-quill-new` (React 19-compatible fork)
- [x] 1.2 Update test mocks for the new rich text editor

## 2. RichTextEditor Component

- [x] 2.1 Create `src/components/common/RichTextEditor.tsx` wrapping react-quill-new
- [x] 2.2 Configure toolbar with allowed formatting options (bold, italic, lists, links, headings, paragraphs)
- [x] 2.3 Connect DOMPurify sanitization on content output

## 3. Voting.tsx — Creation Dialog

- [x] 3.1 Replace `<TextField multiline>` com `<RichTextEditor>` no diálogo de criação de pauta
- [x] 3.2 Ensure `newTopicContent` state stores HTML string from the editor

## 4. TopicDetail.tsx — Content Display

- [x] 4.1 Replace `<ReactMarkdown>` com `<SanitizedHTML>` para renderizar o conteúdo da pauta
- [x] 4.2 Garantir fallback para Markdown em pautas existentes (detectar se conteúdo é HTML ou Markdown)

## 5. Tests

- [x] 5.1 Update `Voting.test.tsx` mocks to work with RichTextEditor
- [ ] 5.2 Add test rendering RichTextEditor component
- [ ] 5.3 Update E2E test in `voting-system.spec.ts` for rich text content flow
