## 1. Banco de dados — adicionar coluna `confirmed_pre_circles`

- [x] 1.1 Criar migration SQL adicionando `confirmed_pre_circles BOOLEAN NOT NULL DEFAULT false` à tabela `restorative_circles`
- [x] 1.2 Atualizar o handler `createRestorativeCircle` em `api-governance/index.ts` para persistir `confirmedPreCircles` no INSERT

## 2. API — novo handler `fetchRestorativeCircleById`

- [x] 2.1 Adicionar case `fetchRestorativeCircleById` em `supabase/functions/api-governance/index.ts`, validando `isAdminUser` e retornando todos os campos do registro (`id, title, description, scheduled_at, location_or_link, status, created_at, confirmed_pre_circles, share_token`) mais o nome do autor via join com `profiles`
- [ ] 2.2 Escrever teste unitário/integração para o novo handler cobrindo: acesso autorizado retorna campos completos, não-admin recebe Forbidden, ID inválido retorna erro de não encontrado

## 3. Frontend — componente `RestorativeCircleDetailDialog`

- [x] 3.1 Criar `src/components/admin/RestorativeCircleDetailDialog.tsx` com o Dialog MUI exibindo todos os campos da convocação: tema, descrição (ou "Não informado"), status (com Chip), autor, data agendada, data de criação, local/link (ou "Não informado"), confirmação de pré-círculos (booleano com ícone)
- [x] 3.2 Adicionar seção informativa de "Protocolo de Justiça Restaurativa" no modal listando os 4 passos (Auto-reflexão, Diálogo Direto, Mediação, Câmara Coletiva) com indicação de que a convocação foi gerada ao final do Passo 4
- [x] 3.3 Implementar loading state enquanto `fetchRestorativeCircleById` carrega e tratamento de erro caso a requisição falhe
- [x] 3.4 Adicionar todas as chaves i18n necessárias para os rótulos do modal

## 4. Frontend — integração em `RestorativeCirclesTab`

- [x] 4.1 Adicionar botão "Ver detalhes" (ícone `Visibility` do MUI) em cada linha da tabela, na coluna de ações, para todos os status de convocação
- [x] 4.2 Gerenciar estado do modal: `selectedCircleId` e `detailOpen` no componente `RestorativeCirclesTab`
- [x] 4.3 Ao clicar no botão, setar `selectedCircleId` com o `id` da linha e abrir `RestorativeCircleDetailDialog`
- [x] 4.4 Ao fechar o modal, limpar `selectedCircleId` e fechar o dialog

## 5. Testes e validação

- [x] 5.1 Escrever testes de renderização para `RestorativeCircleDetailDialog`: exibe campos preenchidos, exibe fallback "Não informado" para campos opcionais ausentes, exibe estado de loading, exibe erro de API
- [x] 5.2 Verificar que o botão "Ver detalhes" aparece para todos os status (open, closed, cancelled) em `RestorativeCirclesTab`
- [x] 5.3 Executar `npm run build` e `npm run typecheck` para garantir que o build passa sem erros
