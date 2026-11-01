## 1. Backend

- [x] 1.1 Criar função pura de validação de links em `supabase/functions/api-work/` (aceita `http`/`https`, recusa outros protocolos, limita o tamanho) com teste `deno test`
- [x] 1.2 Aplicar a validação em `taskCompletion.ts` e nos pontos de `index.ts` que gravam anexos de evidência (`submitActivity`), recusando antes de gravar quando um anexo `link` for inválido
- [x] 1.3 Gravar links com `file_type = 'link'` e `file_size` nulo

## 2. Frontend

- [x] 2.1 Criar componente de entrada de links (campo, botão adicionar, lista com remover, validação `http`/`https` e mensagem de erro)
- [x] 2.2 Usar o componente em `RegisterWork.tsx` e `SubmitTaskProof.tsx`, juntando os links aos anexos enviados
- [x] 2.3 Em `AttachmentList.tsx`, exibir itens `file_type = 'link'` como âncora (`target="_blank"`, `rel="noopener noreferrer"`), sem visualizador nem download, e sem link quando o protocolo for inválido
- [x] 2.4 Adicionar as chaves i18n pt/en

## 3. Validação

- [x] 3.1 Testes do componente de entrada (link válido, protocolo recusado, remover) e do `AttachmentList` (âncora com `rel`, protocolo inválido sem link)
- [x] 3.2 Verificar que o envio sem evidência continua aceito
- [x] 3.3 Executar `npm run build` sem erros
