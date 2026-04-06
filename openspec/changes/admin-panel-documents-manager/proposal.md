## Why

A transparência é um pilar fundamental da Associação Tekuá. Atualmente, o portal não possui uma forma centralizada de armazenar e exibir documentos oficiais (estatutos, atas de assembleia, relatórios financeiros e editais). Centralizar esses documentos no portal facilita o acesso dos membros e garante a integridade da informação.

## What Changes

Implementar um gerenciador de documentos no Painel Administrativo:
1.  Criação de uma nova sub-seção "Documentos" no `AdminPanel.tsx`.
2.  Interface de upload de arquivos (PDF, DOCX, Imagens).
3.  Formulário para metadados do documento (Título, Categoria, Data, Visibilidade).
4.  Integração com o Supabase Storage para armazenamento físico.
5.  Criação de tabela `documents` no banco de dados para gestão de metadados.

## Capabilities

### New Capabilities
- `admin-docs`: Permite que administradores gerenciem o repositório de documentos oficiais da plataforma.

### Modified Capabilities
- None

## Impact

- `src/pages/AdminPanel.tsx`: Nova aba/seção de gestão.
- `supabase/migrations`: Nova tabela `documents` e bucket `official-docs`.
- `translation.json`: Novos termos de gestão documental.
