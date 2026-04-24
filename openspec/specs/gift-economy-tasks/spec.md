# gift-economy-tasks Specification

## Purpose
TBD - created by archiving change quadro-tarefas-economia-dadiva. Update Purpose after archive.
## Requirements
### Requirement: Quadro de Tarefas Comunitárias
O sistema SHALL permitir que membros acessem um quadro central para cadastrar e visualizar tarefas solicitadas pela comunidade.

#### Scenario: Cadastro de Nova Tarefa
- **WHEN** um membro autenticado descreve uma tarefa, define o valor em "Surreais" e anexa a localização geográfica aproximada.
- **THEN** a tarefa é publicada no quadro com status "Aberta".

#### Scenario: Aceitação de Tarefa
- **WHEN** um outro membro clica em "Assumir Tarefa".
- **THEN** o status muda para "Em Execução" e o nome do executor é vinculado à tarefa.

### Requirement: Economia Surreal e Provas
O sistema SHALL garantir o reconhecimento do valor do trabalho através da moeda Surreal e evidências físicas.

#### Scenario: Envio de Prova Georreferenciada
- **WHEN** o executor clica em "Concluir Tarefa" e anexa uma foto.
- **THEN** o sistema captura as coordenadas de GPS no momento do upload e envia para validação do requisitante.

#### Scenario: Pagamento Virtual (Wallet)
- **WHEN** o requisitante clica em "Aprovar Execução" após revisar as fotos.
- **THEN** o sistema transfere o valor em Surreais do requisitante para a carteira (Wallet) do executor e gera um log de transação.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.

