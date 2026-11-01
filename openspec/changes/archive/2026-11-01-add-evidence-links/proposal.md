## Why

A evidência de uma tarefa ou demanda só aceita arquivos enviados (fotos e documentos). Muitas contribuições já têm prova em outro lugar: um álbum de fotos, uma pasta compartilhada, um vídeo, um formulário, uma localização. Hoje o membro precisa colar o endereço na descrição, onde ele não é clicável, e os validadores têm de copiá-lo à mão.

## What Changes

- Permitir adicionar **links** como evidência, ao lado dos arquivos, nos formulários que já aceitam evidência: Registro de Trabalho e conclusão de tarefa (`SubmitTaskProof`).
- Aceitar apenas endereços `http` e `https`; qualquer outro protocolo é recusado no formulário e no servidor.
- Exibir cada link na lista de evidências como item clicável, que abre em outra aba com `rel="noopener noreferrer"`, sem passar pelo visualizador de arquivos.
- Guardar o link junto às evidências existentes, sem nova tabela nem migration.

## Capabilities

### New Capabilities
- (nenhuma)

### Modified Capabilities
- `evidence-capture`: a evidência passa a poder ser um link clicável, além de foto e documento.

## Impact

- **Frontend:** novo componente de entrada de links, `src/components/common/AttachmentList.tsx` (item de link), `RegisterWork.tsx`, `SubmitTaskProof.tsx`.
- **Backend:** `supabase/functions/api-work/index.ts` e `taskCompletion.ts` (validação do endereço ao gravar).
- **Banco:** nenhuma migration; usa `activity_attachments`.
- **i18n:** novas chaves pt/en.
