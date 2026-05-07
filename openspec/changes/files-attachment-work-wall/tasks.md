## 1. Banco de Dados e Infraestrutura

- [x] 1.1 Criar migração para a tabela `activity_attachments`.
- [x] 1.2 Configurar políticas de RLS para a tabela `activity_attachments`.
- [x] 1.3 Revisar e atualizar políticas de Storage para o bucket `task-evidence`.

## 2. Backend (Edge Functions)

- [x] 2.1 Atualizar `fetchActivityDetail` no `api-work` para retornar anexos.
- [x] 2.2 Atualizar `createActivity` no `api-work` para processar e salvar anexos.
- [x] 2.3 Atualizar `submitProof` no `api-work` para suportar múltiplos anexos de evidência.
- [x] 2.4 Atualizar `fetchActivities` no `api-work` para incluir contagem de anexos.

## 3. Componentes Frontend

- [x] 3.1 Desenvolver componente `FileUploader` para upload múltiplo de arquivos.
- [x] 3.2 Desenvolver componente `AttachmentList` para exibição e download de arquivos.
- [x] 3.3 Adicionar traduções para os novos termos de anexos em `pt.json` e `en.json`.

## 4. Integração nas Páginas

- [x] 4.1 Integrar `FileUploader` na página `CreateDemand.tsx`.
- [x] 4.2 Integrar `FileUploader` na página `RegisterWork.tsx`.
- [x] 4.3 Integrar `FileUploader` na página `SubmitTaskProof.tsx`.
- [x] 4.4 Atualizar `TaskDetail.tsx` para exibir a lista de anexos (especificações e evidências).
- [x] 4.5 Atualizar `ActivityCard.tsx` para mostrar indicador visual de anexos.

## 5. Verificação e Testes

- [x] 5.1 Validar fluxo completo de criação de demanda com anexos PDF/Doc.
- [x] 5.2 Validar fluxo de submissão de prova com múltiplas imagens e documentos.
- [x] 5.3 Verificar permissões de download entre diferentes usuários membros.
