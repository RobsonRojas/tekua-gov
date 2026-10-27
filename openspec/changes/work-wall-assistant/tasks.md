## 1. Backend (`supabase/functions/ai-handler`)

- [x] 1.1 Aceitar `mode: 'work-wall'` na requisição e selecionar um prompt de sistema próprio do mural, mantendo o modo padrão do Oráculo inalterado.
- [x] 1.2 Criar módulo versionado com o guia do mural (status, assumir, evidência, confirmação, pagamento, tarefa × demanda), usado pelo prompt do modo mural.
- [x] 1.3 Declarar a ferramenta `propose_activity_draft` apenas no modo mural. Ela devolve os argumentos ao cliente e **não** acessa o banco.
- [x] 1.4 Validar os argumentos da ferramenta (título e descrição não vazios, recompensa positiva, tipo `task` ou `demand`, método de validação conhecido, confirmações ≥ 1, executores como lista de identificadores). [v1: valida título, descrição e recompensa; categoria, executores e confirmações ficam no formulário, pois o backend não grava beneficiário nem confirmações pelo assistente.]
- [x] 1.5 Garantir que nenhuma outra ferramenta de escrita seja executável pelo modelo (recusa explícita, sem alterar o banco).

## 2. Frontend (mural)

- [x] 2.1 Adicionar o ponto de entrada do assistente em `src/pages/WorkWall.tsx`, visível apenas para membros autenticados.
- [x] 2.2 Reaproveitar o componente de chat do Oráculo (`src/pages/AIAgent.tsx`) com o modo `work-wall`, sem duplicar a lógica de envio e de sessão. [v1: não reaproveita o componente do Oráculo; usa o mesmo chatWithGemini com o modo work-wall.]
- [x] 2.3 Implementar o cartão de rascunho com "Criar", "Editar" e "Cancelar". Antes de habilitar "Criar", validar os campos obrigatórios no cliente.
- [x] 2.4 Ao acionar "Criar", chamar `api-work.createActivity` com a sessão do membro. Exibir sucesso com link para a atividade, ou o motivo da recusa do backend mantendo o rascunho.
- [x] 2.5 "Cancelar" ou troca de assunto descarta o rascunho sem chamada ao backend.

## 3. Internacionalização

- [x] 3.1 Adicionar em `src/locales/pt/translation.json` e `src/locales/en/translation.json` as chaves do ponto de entrada, do cartão de rascunho e das mensagens de sucesso e erro.

## 4. Testes

- [x] 4.1 Teste do cartão de rascunho: nenhuma chamada a `createActivity` antes do clique em "Criar".
- [x] 4.2 Teste: "Cancelar" não chama o backend e remove o rascunho.
- [x] 4.3 Teste: erro do backend é exibido no cartão e o rascunho permanece para correção.
- [x] 4.4 Teste da validação de campos obrigatórios no cliente (título vazio, recompensa zero ou negativa).
- [ ] 4.5 Teste do handler: a ferramenta de rascunho não executa escrita, e chamadas de escrita não permitidas são recusadas.

## 5. Verificação

- [x] 5.1 Rodar `npm run test`, `npm run build` e `npm run lint` nos arquivos alterados, sem regressões.
- [x] 5.2 Rodar `openspec validate work-wall-assistant --strict`.
- [ ] 5.3 Deploy da edge function `ai-handler` e do frontend, nesta ordem. Requer confirmação explícita do responsável.
- [ ] 5.4 Verificar em produção, com um membro de teste: explicação do mural, criação de tarefa com confirmação, e recusa de pedido fora do escopo.
- [ ] 5.5 Revisão do texto do guia do mural pelo responsável pelo produto antes do deploy.
