## Context

As tarefas de economia de dádiva no Work Wall são criadas através da página `/create-demand` e processadas pela Edge Function `api-work`. Atualmente, não há mecanismo para editar tarefas já existentes após sua criação inicial. A proposta visa estender a Edge Function `api-work` com a ação `updateActivity`, implementar controles de validação rigorosos baseados na role do usuário (administrador ou criador original) e disponibilizar um botão e formulário de edição (MUI Dialog) no frontend.

## Goals / Non-Goals

**Goals:**
- Implementar a funcionalidade de edição de tarefas no backend (`updateActivity` em `api-work`) com validação de segurança.
- Exibir o botão "Editar" de forma condicionada no frontend apenas para administradores ou para o autor/requisitante da tarefa.
- Desenvolver um formulário de edição premium via modal (MUI Dialog) dentro de `TaskDetail.tsx` permitindo editar: Título, Descrição, Valor de Recompensa (Surreal), Executor Atribuído (para administradores) e Documentos de Referência.
- Registrar log de auditoria ao realizar edições.

**Non-Goals:**
- Permitir a edição de evidências ou confirmações de validação já consolidadas por terceiros.
- Alterar o fluxo financeiro principal ou fluxo de auditoria de pagamentos, limitando-se apenas a manter a integridade dos valores atuais.

## Decisions

### 1. Localização e Interface do Formulário de Edição
- **Decisão:** Utilizar um modal interativo (MUI Dialog) dentro de `TaskDetail.tsx` em vez de criar uma rota separada.
- **Razão:** Edições são ações secundárias e rápidas. Manter o formulário em um modal evita carregamentos adicionais de página, melhora a percepção de performance e mantém o usuário no contexto visual da tarefa.

### 2. Validação Multicamada (Frontend + Backend)
- **Decisão:** A validação de permissões será feita no frontend (ocultando botões) e reforçada rigorosamente no backend na Edge Function `api-work`.
- **Razão:** Segurança em primeiro lugar. Apenas ocultar o botão no frontend não impede requisições manuais maliciosas por API. O backend validará a associação direta com `requester_id` ou se o usuário autenticado possui `admin` em seus perfis.

### 3. Gerenciamento de Anexos na Edição
- **Decisão:** Na submissão das alterações, deletar referências anteriores de anexos de referência (que não sejam evidências) e registrar os novos fornecidos pelo componente `FileUploader`.
- **Razão:** Simplifica o gerenciamento de estados e garante sincronia perfeita entre os arquivos mostrados na interface e os salvos no banco.

## Risks / Trade-offs

- **[Risco] Recompensas abusivas por usuários comuns** → *Mitigação*: Qualquer edição redefinirá a tarefa se necessário, ou a edição só será válida para tarefas não finalizadas. A validação de número positivo para recompensa continua mandatória.
