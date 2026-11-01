## Purpose

Permite que administradores visualizem, em um modal contextual, todos os detalhes de uma convocação de Círculo Restaurativo — incluindo dados do formulário, confirmação de pré-círculos e o resumo do caminho percorrido no wizard — sem sair do painel de governança.

## ADDED Requirements

### Requirement: Botão de visualização de detalhes na lista de convocações
Cada item na listagem de convocações de Círculo Restaurativo SHALL exibir um botão de ação que abre os detalhes completos daquela convocação.

#### Scenario: Botão visível para todos os registros
- **WHEN** a listagem de convocações é carregada com sucesso
- **THEN** cada linha SHALL conter um botão identificável como "Ver detalhes" (ou ícone equivalente) na coluna de ações

#### Scenario: Botão disponível independente do status
- **WHEN** a linha exibe uma convocação com status "open", "closed" ou "cancelled"
- **THEN** o botão de ver detalhes SHALL estar presente e habilitado

### Requirement: Modal de detalhes completos da convocação
Ao ativar o botão de detalhes, o sistema SHALL exibir um modal (dialog) com todas as informações da convocação selecionada.

#### Scenario: Abertura do modal com dados básicos
- **WHEN** o usuário clica no botão "Ver detalhes" de uma convocação
- **THEN** o sistema SHALL abrir um modal exibindo: tema, status, autor, data agendada, data de criação

#### Scenario: Exibição de campos opcionais preenchidos
- **WHEN** a convocação possui descrição e/ou local/link preenchidos
- **THEN** o modal SHALL exibir esses campos com seus respectivos valores

#### Scenario: Ausência de campos opcionais
- **WHEN** a convocação não possui descrição ou local/link
- **THEN** o modal SHALL indicar visualmente a ausência (ex: "Não informado") em vez de exibir campo em branco

#### Scenario: Exibição da confirmação de pré-círculos
- **WHEN** o modal é aberto
- **THEN** o sistema SHALL exibir se os pré-círculos individuais foram confirmados pelo autor (campo `confirmed_pre_circles`)

#### Scenario: Resumo do caminho percorrido no wizard
- **WHEN** o modal é aberto
- **THEN** o sistema SHALL exibir um resumo informativo dos 4 passos do Protocolo de Justiça Restaurativa (Auto-reflexão, Diálogo Direto, Mediação, Câmara Coletiva), indicando que a convocação foi criada ao final do Passo 4

#### Scenario: Fechamento do modal
- **WHEN** o usuário clica fora do modal ou em um botão de fechar
- **THEN** o modal SHALL ser fechado sem alterar nenhum dado

### Requirement: API de detalhes de convocação por ID (somente admin)
O sistema SHALL fornecer um endpoint de API que retorna todos os campos de uma convocação dado seu `id`, acessível exclusivamente a administradores.

#### Scenario: Acesso autorizado retorna detalhes completos
- **WHEN** um administrador invoca `fetchRestorativeCircleById` com um `id` válido
- **THEN** o sistema SHALL retornar: `id`, `title`, `description`, `scheduled_at`, `location_or_link`, `status`, `created_at`, `confirmed_pre_circles`, `share_token` e o nome do autor

#### Scenario: Acesso negado a não-administradores
- **WHEN** um usuário não-administrador tenta invocar `fetchRestorativeCircleById`
- **THEN** o sistema SHALL retornar erro de autorização (Forbidden)

#### Scenario: ID não encontrado
- **WHEN** `fetchRestorativeCircleById` é chamado com um `id` inexistente
- **THEN** o sistema SHALL retornar erro indicando que a convocação não foi encontrada
