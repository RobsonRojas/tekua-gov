## ADDED Requirements

### Requirement: Redirecionamento por Deep Link de Tarefa
O sistema SHALL suportar o acesso direto a uma tarefa específica através de parâmetros na URL.

#### Scenario: Acesso via parâmetro de URL
- **WHEN** um usuário acessa a URL com o parâmetro de tarefa ou rota direta.
- **THEN** o sistema SHALL abrir uma página ou modal de detalhes com informações completas da tarefa (título, descrição, evidências, histórico).

### Requirement: Destaque Visual de Tarefa Vinculada
O sistema SHALL destacar visualmente a tarefa que foi acessada via deep link para facilitar sua localização.

#### Scenario: Destaque de tarefa
- **WHEN** a página do mural é carregada com um `task_id` válido.
- **THEN** o sistema SHALL rolar até a tarefa e aplicar um efeito visual de destaque (ex: borda colorida ou brilho).
