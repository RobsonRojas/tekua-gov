## ADDED Requirements

### Requirement: Troca de Tema (theme-management)
O sistema **DEVE (SHALL)** permitir que o usuário alterne entre os temas claro e escuro, refletindo a mudança visual instantaneamente em todos os componentes da interface.

#### Scenario: Seleção Manual de Tema
- **WHEN** o usuário clica no ícone de alternância de tema no cabeçalho.
- **THEN** o tema atual deve mudar (de claro para escuro ou vice-versa).
- **THEN** todas as cores de fundo, texto e bordas devem ser atualizadas para a paleta correspondente.
- **THEN** a nova preferência deve ser salva no `localStorage`.

#### Scenario: Persistência após Recarregamento
- **WHEN** o usuário seleciona o tema "escuro" e recarrega a página.
- **THEN** o portal deve ser renderizado diretamente no modo escuro, evitando o "flicker" (lampejo) do tema claro.

#### Scenario: Sincronização com Perfil
- **WHEN** um usuário autenticado altera o tema.
- **THEN** o sistema deve tentar atualizar o campo `preferred_theme` na tabela `profiles` do Supabase.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.
