## Why

Os formulários de tarefa, demanda e registro de trabalho não explicam como a confirmação funciona: quem confirma, quantas confirmações bastam e quando a recompensa é paga. Pior, os formulários de criação mostram o campo "Número de Confirmações", mas o servidor o ignora: `createActivity` sempre cria a atividade com aprovação do solicitante e usa a quantidade das configurações de governança. O membro preenche um número que não tem efeito e fica sem saber a regra real.

## What Changes

- Adicionar um aviso explicativo nos formulários de criação de tarefa, criação de demanda e registro de trabalho, descrevendo a regra de confirmação que vale para o caso.
- Nos formulários de criação de tarefa e de demanda, a regra é aprovação do solicitante: ele ou um administrador confirma, uma confirmação conclui a atividade e paga a recompensa, e em regra quem executa não confirma o próprio trabalho.
- No registro de trabalho, o aviso muda conforme o beneficiário: para a Tekuá, a comunidade confirma até atingir o número definido pela Governança; para um membro, só ele ou um administrador confirma, e uma confirmação basta.
- Remover o campo "Número de Confirmações" dos formulários de criação, onde não tem efeito.
- Na edição de uma atividade, mostrar o campo somente quando a atividade usa confirmação pela comunidade.

## Capabilities

### New Capabilities
- (nenhuma)

### Modified Capabilities
- `work-registration`: os formulários passam a explicar a regra de confirmação e deixam de oferecer um campo sem efeito.

## Impact

- `src/pages/CreateTask.tsx`, `src/pages/CreateDemand.tsx`, `src/pages/RegisterWork.tsx`, `src/pages/TaskDetail.tsx`: avisos e remoção do campo.
- `src/locales/pt/translation.json` e `src/locales/en/translation.json`: novas chaves.
- Sem mudança de banco nem de regra no servidor.
- Esta mudança convive com `register-work-validation-notice`, que também acrescenta um aviso ao registro de trabalho (destino na coluna "Para Validar"); os dois avisos devem ficar juntos e sem repetir o mesmo conteúdo.
