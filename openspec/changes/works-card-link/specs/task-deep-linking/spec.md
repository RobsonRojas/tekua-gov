## ADDED Requirements

### Requirement: Redirecionamento por Deep Link de Tarefa
O sistema SHALL suportar o acesso direto a uma tarefa específica através de parâmetros na URL.

#### Scenario: Acesso via parâmetro de URL
- **WHEN** um usuário acessa a URL do mural com o parâmetro `task_id`.
- **THEN** o sistema SHALL abrir automaticamente os detalhes da tarefa correspondente ou destacá-la na interface.

### Requirement: Destaque Visual de Tarefa Vinculada
O sistema SHALL destacar visualmente a tarefa que foi acessada via deep link para facilitar sua localização.

#### Scenario: Destaque de tarefa
- **WHEN** a página do mural é carregada com um `task_id` válido.
- **THEN** o sistema SHALL rolar até a tarefa e aplicar um efeito visual de destaque (ex: borda colorida ou brilho).
