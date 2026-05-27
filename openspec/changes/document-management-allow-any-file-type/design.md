## Context

O sistema de documentos oficias da comunidade limitava os uploads a tipos específicos, causando atrito quando havia a necessidade de submeter planilhas, imagens ou outros arquivos estruturados que são úteis.

## Goals / Non-Goals

**Goals:**
- Permitir o upload de virtualmente qualquer tipo de arquivo (dentro de limites razoáveis de segurança do Supabase) no Gerenciador de Documentos.
- Atualizar a UI para não bloquear seleções de arquivos que não sejam PDF ou Docx.

**Non-Goals:**
- Não iremos renderizar todo tipo de arquivo no frontend (ex: não tentaremos criar um visualizador de planilhas). Arquivos desconhecidos farão download em vez de preview no browser.

## Decisions

- **Frontend**: Remoção da propriedade `accept` restritiva no input de upload. O componente aceitará todos os tipos (`*/*`) ou uma lista mais ampla e genérica.
- **Backend/Storage**: Atualização das políticas de Supabase Storage para garantir que não existam restrições de MIME type rígidas no bucket `documents`, mas mantendo restrições de tamanho (max size).

## Risks / Trade-offs

- **Risk**: Upload de executáveis perigosos (ex: `.exe`, `.bat`).
- **Mitigation**: Poderemos manter uma blacklist básica na borda (Edge Function ou no RLS) para bloquear mime types perigosos, mas a UI permitirá livremente documentos de trabalho e mídia.
