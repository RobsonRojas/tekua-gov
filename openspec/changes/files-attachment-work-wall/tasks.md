## 1. Banco de Dados e Infraestrutura

- [ ] 1.1 Criar migração para a tabela `activity_attachments`.
- [ ] 1.2 Configurar políticas de RLS para a tabela `activity_attachments`.
- [ ] 1.3 Revisar e atualizar políticas de Storage para o bucket `task-evidence`.

## 2. Backend (Edge Functions)

- [ ] 2.1 Atualizar `fetchActivityDetail` no `api-work` para retornar anexos.
- [ ] 2.2 Atualizar `createActivity` no `api-work` para processar e salvar anexos.
- [ ] 2.3 Atualizar `submitProof` no `api-work` para suportar múltiplos anexos de evidência.
- [ ] 2.4 Atualizar `fetchActivities` no `api-work` para incluir contagem de anexos.

## 3. Componentes Frontend

- [ ] 3.1 Desenvolver componente `FileUploader` para upload múltiplo de arquivos.
- [ ] 3.2 Desenvolver componente `AttachmentList` para exibição e download de arquivos.
- [ ] 3.3 Adicionar traduções para os novos termos de anexos em `pt.json` e `en.json`.

## 4. Integração nas Páginas

- [ ] 4.1 Integrar `FileUploader` na página `CreateDemand.tsx`.
- [ ] 4.2 Integrar `FileUploader` na página `RegisterWork.tsx`.
- [ ] 4.3 Integrar `FileUploader` na página `SubmitTaskProof.tsx`.
- [ ] 4.4 Atualizar `TaskDetail.tsx` para exibir a lista de anexos (especificações e evidências).
- [ ] 4.5 Atualizar `ActivityCard.tsx` para mostrar indicador visual de anexos.

## 5. Verificação e Testes

- [ ] 5.1 Validar fluxo completo de criação de demanda com anexos PDF/Doc.
- [ ] 5.2 Validar fluxo de submissão de prova com múltiplas imagens e documentos.
- [ ] 5.3 Verificar permissões de download entre diferentes usuários membros.
