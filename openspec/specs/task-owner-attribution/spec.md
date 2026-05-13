# task-owner-attribution Specification

## Purpose
Permitir que administradores e membros do conselho atribuam tarefas diretamente a membros específicos da associação durante a criação ou edição de demandas.

## Requirements

### Requirement: Autorização de Atribuição de Executor
O sistema SHALL permitir que apenas usuários com perfis de `admin` ou `transversal_council` visualizem e utilizem o seletor de executor nas interfaces de criação e edição de demandas.

#### Scenario: Administrador visualiza seletor de executor
- **WHEN** um usuário com perfil `admin` acessa a página de criação de demanda
- **THEN** o sistema exibe o seletor de "Executor/Dono da Tarefa" na lista de campos

#### Scenario: Membro comum não visualiza seletor de executor
- **WHEN** um usuário com perfil `member` acessa a página de criação de demanda
- **THEN** o sistema não exibe o seletor de "Executor/Dono da Tarefa"

### Requirement: Seleção de Executor da Lista de Membros
O seletor de executor SHALL carregar e listar todos os perfis ativos da plataforma para seleção por parte dos administradores.

#### Scenario: Listagem de membros ativos
- **WHEN** o administrador abre o seletor de executor
- **THEN** o sistema exibe uma lista de nomes dos membros ativos cadastrados no sistema

### Requirement: Persistência da Atribuição de Executor
Ao salvar uma demanda com um executor atribuído, o sistema SHALL registrar o `worker_id` na tabela de atividades e garantir que a tarefa seja vinculada corretamente a esse usuário.

#### Scenario: Criação de tarefa com executor atribuído
- **WHEN** o administrador envia o formulário de criação de demanda com um executor selecionado
- **THEN** o sistema grava o `worker_id` na atividade e a tarefa passa a ser listada nas contribuições do membro selecionado
