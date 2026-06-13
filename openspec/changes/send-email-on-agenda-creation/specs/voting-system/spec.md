## MODIFIED Requirements

### Requirement: Plataforma de Deliberação
O sistema SHALL permitir o debate organizado e a tomada de decisão formal através de temas e votações. O editor de conteúdo DEVE ser compatível com ambientes React 19 para evitar falhas de renderização. Adicionalmente, a criação de um novo tema/pauta DEVE acionar o envio de notificações por email para os membros.

#### Scenario: Criação de Tema por Administrador com Notificação
- **WHEN** um administrador preenche o título e o conteúdo em um editor de texto rico estável e define o prazo de encerramento.
- **THEN** o sistema salva a pauta como "Ativa" e a disponibiliza para todos os membros sem causar falhas no navegador.
- **THEN** o sistema notifica os membros sobre a nova pauta criada através do envio de email.

#### Scenario: Debate em Texto Rico e Multilíngue
- **WHEN** um membro acessa a página de detalhes de um tema e insere um comentário no seu idioma.
- **THEN** o sistema armazena o comentário em um campo JSONB, utilizando o idioma atual como chave, e o exibe cronologicamente garantindo a integridade visual da página.
