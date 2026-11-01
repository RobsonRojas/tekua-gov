# governance-protocols Specification

## Purpose
Permite que a vila mantenha protocolos e procedimentos operacionais padrão (POPs) na área de Governança, para que qualquer membro os consulte e os vincule a tarefas e demandas.

## Requirements

### Requirement: Área de protocolos e POPs na Governança
A página de serviços de Governança SHALL oferecer acesso a uma área de protocolos/POPs, que lista os protocolos ativos com título e permite pesquisar por título.

#### Scenario: Acesso pela página de Governança
- **WHEN** um membro abre a página de serviços de Governança
- **THEN** a página SHALL exibir o acesso à área de protocolos e POPs

#### Scenario: Pesquisa por título
- **WHEN** o membro digita um texto no campo de pesquisa da lista
- **THEN** a lista SHALL exibir somente os protocolos cujo título contém o texto

#### Scenario: Consulta do texto completo
- **WHEN** qualquer membro abre um protocolo
- **THEN** o sistema SHALL exibir o título e o texto completo, formatado em Markdown

### Requirement: Cadastro e edição de protocolos restritos a administradores e Conselho
O sistema SHALL permitir criar, editar e arquivar protocolos somente a administradores e a membros do Conselho Transversal, recusando a escrita a qualquer outro usuário no servidor.

#### Scenario: Criação por usuário autorizado
- **WHEN** um administrador ou membro do Conselho cria um protocolo com título e texto
- **THEN** o protocolo SHALL ser salvo como ativo e aparecer na lista

#### Scenario: Escrita negada a membro comum
- **WHEN** um usuário sem papel de administrador ou Conselho tenta criar, editar ou arquivar um protocolo
- **THEN** o sistema SHALL recusar com erro de autorização e NÃO alterar nenhum dado

#### Scenario: Título obrigatório
- **WHEN** o título está vazio ou tem mais de 200 caracteres
- **THEN** o sistema SHALL recusar o cadastro e informar o motivo

#### Scenario: Arquivamento
- **WHEN** um usuário autorizado arquiva um protocolo
- **THEN** o protocolo SHALL deixar de aparecer na lista e na seleção das atividades
- **AND** as atividades que já o usam SHALL continuar exibindo-o

#### Scenario: Controles de escrita ocultos
- **WHEN** um membro comum abre a área de protocolos
- **THEN** a área SHALL NÃO exibir os controles de criar, editar ou arquivar
