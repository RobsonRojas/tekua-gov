## MODIFIED Requirements

### Requirement: Plataforma de Deliberação
O sistema SHALL permitir o debate organizado e a tomada de decisão formal através de temas e votações. O editor de conteúdo DEVE ser compatível com ambientes React 19 para evitar falhas de renderização. Adicionalmente, a criação de um novo tema/pauta DEVE acionar o envio de notificações por email para os membros. O envio de comentários DEVE persistir corretamente na tabela `topic_comments` sem falhar por restrições de colunas legadas.

#### Scenario: Criação de Tema por Administrador com Notificação
- **WHEN** um administrador preenche o título e o conteúdo em um editor de texto rico estável e define o prazo de encerramento.
- **THEN** o sistema salva a pauta com status `open` ("Aberta"), um valor aceito pela restrição de status da tabela, e a disponibiliza para todos os membros sem causar falhas no navegador.
- **THEN** o sistema notifica os membros sobre a nova pauta criada através do envio de email.

#### Scenario: Debate em Texto Rico e Multilíngue
- **WHEN** um membro acessa a página de detalhes de um tema e insere um comentário no seu idioma.
- **THEN** o sistema armazena o comentário em um campo JSONB, utilizando o idioma atual como chave, e o exibe cronologicamente garantindo a integridade visual da página.

#### Scenario: Envio de Comentário sem Erro de Coluna Legada
- **WHEN** um membro autenticado clica em "Enviar" com texto de comentário preenchido
- **THEN** o sistema persiste o comentário com sucesso na tabela `topic_comments` sem retornar erro 400 relacionado à coluna `content_old`

## ADDED Requirements

### Requirement: Filtro de Usuários no Sistema de Menção
O sistema SHALL filtrar a lista de usuários sugeridos no campo de menção (`@`) de acordo com o texto digitado pelo usuário após o `@`, correspondendo ao `full_name` do membro de forma case-insensitive.

#### Scenario: Filtro por nome ao digitar após @
- **WHEN** um membro digita `@Ana` em um campo de comentário
- **THEN** o sistema exibe apenas os membros cujo `full_name` contenha "Ana" (case-insensitive), não a lista completa de membros

#### Scenario: Lista vazia quando nenhum membro corresponde
- **WHEN** um membro digita uma sequência após `@` que não corresponde a nenhum membro cadastrado
- **THEN** o sistema exibe a mensagem "Nenhum usuário encontrado" no popover de sugestões

#### Scenario: Sem filtro retorna lista limitada
- **WHEN** um membro digita apenas `@` sem texto adicional
- **THEN** o sistema exibe até 5 membros em ordem alfabética por `full_name`
