## Context

Ver `proposal.md` — Why. Estado atual que condiciona a abordagem:

- O Oráculo (`src/pages/AIAgent.tsx`) chama a edge function `ai-handler`, que autentica o usuário pelo JWT, declara ferramentas para o Gemini e executa as de leitura (`get_user_balance`, `get_activity_history`) com o cliente Supabase do próprio usuário.
- A criação de atividades é feita hoje pela ação `createActivity` de `api-work`, chamada a partir de `CreateTask.tsx` e `CreateDemand.tsx`. Essa ação valida título, descrição e recompensa positiva, e aplica a confirmação mínima de `governance_settings`. Ela **não** verifica saldo ao criar.
- O mural (`src/pages/WorkWall.tsx`) lista atividades via `api-work.fetchActivities` e não tem ponto de entrada para o assistente.
- A spec `ai-tool-executor` proíbe escrita por ferramentas da IA; esta mudança abre uma exceção controlada (ver `specs/ai-tool-executor/spec.md`).

## Goals / Non-Goals

**Goals:**
- Um único motor de IA (o do Oráculo) com um modo do mural, em vez de um segundo backend.
- A gravação de uma atividade sempre ocorre por um clique do membro, nunca por decisão do modelo.
- Reaproveitar as regras de criação já existentes, sem duplicá-las no assistente.

**Non-Goals:**
- Não criar uma tabela de rascunhos no banco. O rascunho vive apenas na conversa até a confirmação.
- Não permitir edição, confirmação, transferência ou exclusão pelo assistente.
- Não mudar o Oráculo em `/ai` além do que for necessário para o modo do mural.
- Não alterar o contrato de `api-work.createActivity`.

## Decisions

**1. Motor compartilhado com modo do mural.**
- *Decisão:* o cliente envia `mode: 'work-wall'` ao `ai-handler`. Esse modo escolhe o prompt de sistema do mural e habilita a ferramenta de rascunho. O modo padrão do Oráculo continua igual.
- *Alternativa rejeitada:* uma edge function nova só para o mural. Duplicaria autenticação, tratamento de erro e a integração com o Gemini, que a spec `ai-guidance` já cobre.

**2. Ferramenta de rascunho que não grava.**
- *Decisão:* o modelo chama `propose_activity_draft` com os campos (título, descrição, recompensa, tipo, categoria, método de validação, confirmações, executores, beneficiário). O `ai-handler` apenas **devolve** esses argumentos ao cliente, sem tocar no banco.
- *Por quê:* a ferramenta é a forma estruturada de o modelo pedir um rascunho, e a gravação fica fora do alcance do modelo. Isso sustenta a regra "nunca gravar sem clique".
- *Alternativa rejeitada:* deixar o modelo chamar `createActivity` diretamente. Violaria a confirmação explícita e permitiria criação por texto gerado.

**3. Gravação no cliente, pela ação existente.**
- *Decisão:* o componente do mural mostra o cartão do rascunho com "Criar" e "Editar". "Criar" chama `apiClient.invoke('api-work', 'createActivity', ...)` com a sessão do membro. O resultado (sucesso ou erro do backend) volta para o cartão.
- *Por quê:* reaproveita validações e permissões do backend, e a RLS e o JWT do membro continuam valendo. Nenhuma credencial de serviço é usada.
- *Pré-validação no cliente:* antes de habilitar "Criar", o cliente checa campos obrigatórios e recompensa positiva, para evitar um erro previsível. A decisão final continua no backend.

**4. Guia do mural como fonte de explicação.**
- *Decisão:* o texto explicativo do mural (status, fluxo de assumir/evidência/confirmação/pagamento, tarefa × demanda) fica num módulo versionado da edge function, com o prompt do modo mural. As respostas devem se basear nele e nos documentos oficiais, como o Oráculo já faz.
- *Por quê:* o guia muda com o produto e precisa estar no repositório, junto com o código que ele descreve.

**5. Confirmação explícita e cancelamento.**
- *Decisão:* o rascunho é um estado da conversa no cliente. "Cancelar" ou uma nova intenção descarta o rascunho sem chamada ao backend.

## Risks / Trade-offs

- **Criação em massa por conversa** → cada criação exige um clique individual. Mitigação: sem criação em lote; a ação existente já é a mesma das telas.
- **Demanda sem verificação de saldo** → `createActivity` não checa saldo hoje, então o assistente herda essa lacuna. Mitigação: registrar como risco pré-existente; não corrigir nesta mudança sem decisão do responsável pelo produto.
- **Prompt injection vindo do texto do membro** → o modelo poderia tentar mudar campos como o beneficiário. Mitigação: o cliente mostra o rascunho antes da gravação, e o backend aplica as permissões de sempre sobre o usuário autenticado.
- **Explicação imprecisa do fluxo** → mitigação: respostas ancoradas no guia; "não encontrei" quando faltar informação; revisão do texto do guia pelo responsável pelo produto antes do deploy.
- **Custo e limite da API Gemini** → o modo do mural reaproveita a mesma integração, sem novo limite a configurar.

## Migration Plan

1. Publicar a edge function `ai-handler` com o modo do mural (sem mudança de banco).
2. Publicar o frontend com o ponto de entrada no mural.
3. **Rollback:** remover o ponto de entrada no mural e reverter `ai-handler`. Nenhum dado é alterado de forma irreversível, pois as atividades criadas são as mesmas que as telas já criam.

## Open Questions

- Nenhuma que mude specs ou abordagem. O texto final do guia do mural deve ser revisado pelo responsável pelo produto antes do deploy, mas isso não altera o comportamento especificado.
