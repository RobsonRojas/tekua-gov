## Context

Atualmente, o Tekuá Gov suporta apenas uma única evidência visual (imagem) por tarefa, armazenada na tabela `activity_evidence`. Não há suporte para arquivos anexados pelo solicitante (requisitante) no momento da criação da demanda, nem suporte para múltiplos arquivos de tipos variados (PDFs, documentos) como prova de trabalho.

## Goals / Non-Goals

**Goals:**
- Permitir múltiplos anexos tanto na criação quanto na submissão de tarefas.
- Suportar diversos tipos de arquivos (imagens, documentos, PDFs).
- Garantir que todos os membros possam visualizar e baixar esses arquivos.
- Manter a segurança de acesso via RLS.

**Non-Goals:**
- Edição de arquivos online.
- Controle de versão de anexos (apenas upload/delete).
- Comentários específicos em anexos (o sistema de interações de tarefas já atende isso).

## Decisions

### 1. Modelo de Dados: Tabela `activity_attachments`
Será criada uma nova tabela para gerenciar todos os anexos de uma atividade, unificando o conceito de "anexos de especificação" (do requisitante) e "anexos de evidência" (do executor).

- **Tabela**: `activity_attachments`
    - `id UUID PRIMARY KEY`
    - `activity_id UUID REFERENCES activities(id)`
    - `user_id UUID REFERENCES profiles(id)`
    - `file_url TEXT` (URL pública do Supabase Storage)
    - `file_name TEXT`
    - `file_type TEXT` (MIME type)
    - `file_size INTEGER`
    - `is_evidence BOOLEAN` (TRUE se for prova de trabalho, FALSE se for anexo da demanda)
    - `created_at TIMESTAMP`

**Racional**: Manter uma tabela separada é mais escalável que usar campos JSONB e permite aplicar RLS de forma granular se necessário.

### 2. Fluxo de Upload
O upload continuará sendo feito via cliente (frontend) diretamente para o bucket `task-evidence` do Supabase Storage, seguido pelo registro dos metadados na nova tabela via Edge Function.

### 3. Atualização de RPCs e Edge Functions
- `api-work` / `createActivity`: Aceitará um array opcional de objetos de anexo.
- `api-work` / `submitProof`: Aceitará múltiplos anexos e os marcará como `is_evidence = true`.
- `fetchActivityDetail`: Incluirá os anexos na resposta.

### 4. Interface do Usuário (UI)
- **Componente `FileUpload`**: Novo componente reutilizável para upload de múltiplos arquivos com barra de progresso.
- **Lista de Anexos**: Exibição em lista com ícones por tipo de arquivo (PDF, Imagem, Doc) e botão de download.

## Risks / Trade-offs

- **Custo de Armazenamento** → Mitigação: Implementar limites de tamanho por arquivo (ex: 10MB) e total por tarefa.
- **Segurança de URLs Públicas** → Mitigação: Embora as URLs sejam públicas, o acesso ao bucket será protegido por políticas que exigem autenticação.
- **Complexidade de Migração** → Mitigação: Manter compatibilidade com a tabela `activity_evidence` legada durante o período de transição.
