## Context

A evidência é gravada em `activity_attachments` (`file_url`, `file_name`, `file_type`, `file_size`, `is_evidence`). Os formulários passam uma lista de anexos a `submitActivity`, `completeTask` e `addEvidence`, e a lista de evidências é exibida por `AttachmentList`, que abre arquivos no `EvidenceViewerModal`.

## Goals / Non-Goals

**Goals:**
- Adicionar links clicáveis como evidência nos fluxos existentes, sem migration.
- Impedir protocolos perigosos (`javascript:`, `data:`) no servidor, não só na tela.

**Non-Goals:**
- Pré-visualizar, validar ou verificar se o link responde.
- Links nos documentos de referência da demanda (apenas evidência).
- Editar ou remover um link depois do envio.

## Decisions

### D1 – Link como linha de `activity_attachments` com `file_type = 'link'`

**Escolha:** o link é uma linha de anexo com `file_url` = endereço, `file_name` = rótulo (o próprio endereço quando vazio), `file_type = 'link'` e `file_size` nulo.

**Alternativa considerada:** nova tabela de links, que exigiria migration, política de acesso e nova consulta, e duplicaria o caminho de leitura e a ordem de exibição.

**Rationale:** as políticas de acesso e as consultas atuais já cobrem a linha, e os três endpoints já gravam essa lista.

### D2 – Validação no servidor, em um único ponto

**Escolha:** uma função pura valida `http`/`https` (via `new URL`) e limita o tamanho. Todo anexo com `file_type = 'link'` que falhar é recusado com erro, antes de qualquer gravação. Os pontos que gravam anexos chamam essa função.

**Rationale:** o formulário é só conveniência; o endereço é exibido a outros membros, e um `javascript:` armazenado seria um vetor de ataque.

### D3 – Exibição como âncora, fora do visualizador

**Escolha:** em `AttachmentList`, itens com `file_type = 'link'` viram `<a target="_blank" rel="noopener noreferrer">` e não usam `onView` nem download. A renderização também confere o protocolo e, se inválido, mostra o texto sem link.

**Rationale:** o visualizador espera arquivos do armazenamento, e uma segunda checagem protege dados antigos ou gravados por outro caminho.

## Risks / Trade-offs

- **Link malicioso para outro site** → o membro sai do app ao clicar; mitigado com `noopener noreferrer` e sem pré-visualização.
- **Dado inválido já gravado** → a checagem na exibição evita um link perigoso.
- **Sem verificação de disponibilidade** → aceito; a evidência continua baseada em confiança.

## Open Questions

Nenhuma.
