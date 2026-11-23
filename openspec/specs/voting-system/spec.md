# voting-system Specification

## Purpose
TBD - created by archiving change voting-system. Update Purpose after archive.
## Requirements
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

### Requirement: Sistema de Votação Formal
O sistema SHALL permitir que membros exerçam seu direito de voto de forma segura e única, apenas em pautas abertas. O registro do voto DEVE atualizar a marcação temporal (`updated_at`) sem quebras de schema ou incompatibilidades na persistência dos votos.

#### Scenario: Votação Única
- **WHEN** um membro autenticado seleciona uma opção (Sim, Não, Abstenção) e confirma seu voto.
- **THEN** o sistema registra o voto associado ao seu ID e atualiza `updated_at`, impedindo que ele vote novamente no mesmo tema e sem retornar erro 400 de coluna inexistente.

#### Scenario: Voto em Pauta Recém-Criada
- **WHEN** um membro vota em uma pauta com status `open`.
- **THEN** o sistema aceita o voto com sucesso.

#### Scenario: Voto em Pauta Encerrada
- **WHEN** um membro tenta votar em uma pauta com status `closed`.
- **THEN** o sistema rejeita o voto informando que a pauta não aceita mais votos.

#### Scenario: Apuração de Resultados
- **WHEN** uma votação é encerrada (tempo expirado ou ação do admin).
- **THEN** o sistema calcula as porcentagens de cada opção e exibe o resultado final para todos os membros.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.

### Requirement: Conteúdo em HTML Sanitizado
O conteúdo da pauta SHALL ser armazenado como HTML sanitizado no campo JSONB `content`, em vez de Markdown. A exibição DEVE renderizar o HTML com segurança.

#### Scenario: Criação de Pauta Salva como HTML
- **WHEN** um administrador cria uma pauta com o editor de texto rico
- **THEN** o conteúdo é salvo como HTML (ex: `<p>Texto com <strong>negrito</strong></p>`) na chave de idioma correspondente

#### Scenario: Exibição Renderiza HTML
- **WHEN** um membro visualiza uma pauta
- **THEN** o HTML é renderizado com segurança, exibindo a formatação visual sem tags visíveis

#### Scenario: Compatibilidade com Dados Existentes
- **WHEN** uma pauta criada anteriormente (Markdown) é visualizada
- **THEN** o sistema ainda renderiza corretamente o Markdown como texto formatado

### Requirement: Responsividade e Contenção de Layout na Descrição da Pauta
A área de exibição da descrição e conteúdo da pauta SHALL conter todo o texto, palavras longas, links e tags HTML dentro dos limites horizontais do card, impedindo vazamentos para fora da tela ou rompimento de layout.

#### Scenario: Descrição com Textos Longos ou Sequências Contínuas
- **WHEN** uma pauta possui palavras longas sem espaços, URLs ou texto extenso no corpo da pauta
- **THEN** o container aplica quebra de linha forçada (`break-word`) e limita a largura máxima a 100%, mantendo todo o conteúdo contido visualmente no card.

### Requirement: Feedback Detalhado no Envio de Comentários
Ao submeter um comentário ou resposta na pauta, o sistema SHALL prover tratamento de erros com exibição de mensagem clara e amigável em caso de falha.

#### Scenario: Erro ao Enviar Comentário
- **WHEN** a API recusa a gravação de um comentário ou ocorre uma falha na requisição
- **THEN** o sistema exibe feedback de erro com o motivo retornado pela API ou mensagem amigável no Snackbar/interface, sem travar silenciosamente.

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

### Requirement: Comentários em Pautas com Respostas
O sistema SHALL permitir que membros autenticados comentem em pautas abertas e respondam a comentários existentes, exibindo cada resposta sob o comentário a que se refere.

#### Scenario: Responder a um comentário
- **WHEN** um membro aciona "Responder" em um comentário e envia o texto
- **THEN** o sistema salva a resposta vinculada ao comentário original e a exibe sob ele, em ordem cronológica

#### Scenario: Resposta a uma resposta
- **WHEN** um membro responde a um comentário que já é uma resposta
- **THEN** o sistema vincula a nova resposta ao comentário de nível superior, mantendo um único nível de encadeamento

#### Scenario: Pauta encerrada
- **WHEN** uma pauta tem status `closed`
- **THEN** os comentários existentes continuam visíveis e o sistema rejeita novos comentários e respostas

#### Scenario: Resposta a comentário de outra pauta
- **WHEN** a requisição indica como comentário-pai um comentário que pertence a outra pauta
- **THEN** o sistema rejeita a requisição

### Requirement: Menção de Membros em Comentários
O sistema SHALL permitir mencionar membros ativos nos comentários e respostas de pauta e notificá-los.

#### Scenario: Selecionar membro ao digitar @
- **WHEN** o membro digita `@` seguido de texto no campo de comentário
- **THEN** o sistema lista membros cujo nome corresponde à busca e, ao escolher um, insere seu nome no texto e o registra como mencionado

#### Scenario: Notificação de menção
- **WHEN** um comentário com membros mencionados é salvo
- **THEN** cada membro mencionado, exceto o autor, recebe uma notificação com link para a pauta

#### Scenario: Notificação de resposta
- **WHEN** uma resposta é salva
- **THEN** o autor do comentário original recebe uma notificação, exceto se for o próprio autor da resposta ou se já recebeu notificação de menção para o mesmo comentário

#### Scenario: Menção inválida
- **WHEN** a requisição inclui IDs que não pertencem a membros existentes
- **THEN** o sistema ignora esses IDs e salva o comentário normalmente

#### Scenario: Destaque da menção
- **WHEN** um comentário com menções é exibido
- **THEN** o nome do membro mencionado aparece destacado no texto

### Requirement: Links Compartilháveis de Pauta e Comentário
O sistema SHALL permitir copiar um link direto para uma pauta e para cada comentário ou resposta, abrindo o conteúdo correspondente para membros autenticados.

#### Scenario: Copiar link da pauta
- **WHEN** um membro aciona o botão de link em um item da lista de pautas ou no detalhe da pauta
- **THEN** o sistema copia para a área de transferência o endereço da pauta e confirma a cópia

#### Scenario: Copiar link do comentário
- **WHEN** um membro aciona o botão de link de um comentário ou resposta
- **THEN** o sistema copia o endereço da pauta apontando para aquele comentário e confirma a cópia

#### Scenario: Abrir link de comentário
- **WHEN** um membro autenticado abre o link de um comentário
- **THEN** a pauta é exibida, a página rola até o comentário e o destaca visualmente

#### Scenario: Link aberto sem sessão
- **WHEN** alguém sem sessão abre o link de uma pauta
- **THEN** o sistema exige login e, após autenticar, leva o membro à pauta ou ao comentário indicado

### Requirement: Recompensa em Surreais por Pauta
O sistema SHALL permitir que o administrador defina, na criação e na edição de uma pauta, um valor de recompensa em surreais (zero ou maior, padrão zero) pago por interação.

#### Scenario: Definir recompensa na criação
- **WHEN** o administrador informa um valor de recompensa ao criar a pauta
- **THEN** a pauta é salva com esse valor

#### Scenario: Editar recompensa
- **WHEN** o administrador edita o valor de recompensa de uma pauta
- **THEN** o novo valor vale para interações futuras e recompensas já pagas não mudam

#### Scenario: Valor inválido
- **WHEN** o valor informado é negativo, não numérico ou acima do limite máximo configurado
- **THEN** o sistema rejeita a criação ou edição

#### Scenario: Edição restrita a administradores
- **WHEN** um membro que não é administrador tenta editar uma pauta
- **THEN** o sistema rejeita a requisição

### Requirement: Crédito de Surreais por Interação com a Pauta
O sistema SHALL creditar surreais ao membro que interage com uma pauta aberta, criando o valor a partir da carteira da tesouraria, registrado no livro-razão.

#### Scenario: Recompensa por voto
- **WHEN** um membro vota em pauta aberta com recompensa maior que zero e ainda não foi recompensado por voto nessa pauta
- **THEN** o sistema credita o valor na carteira do membro, debita a tesouraria e registra o lançamento no livro-razão

#### Scenario: Recompensa por comentário ou resposta
- **WHEN** um membro comenta ou responde em pauta aberta com recompensa maior que zero e ainda não foi recompensado por comentário nessa pauta
- **THEN** o sistema credita o valor ao membro e debita a tesouraria

#### Scenario: Uma recompensa por tipo de interação
- **WHEN** um membro já recompensado por um tipo de interação realiza novamente o mesmo tipo na mesma pauta
- **THEN** a interação é registrada normalmente e nenhum novo crédito é gerado

#### Scenario: Atomicidade
- **WHEN** a interação falha (voto ou comentário não é salvo)
- **THEN** nenhum crédito é gerado; e quando o crédito falha, a interação continua salva sem duplicar pagamento em tentativas futuras

#### Scenario: Pauta sem recompensa ou encerrada
- **WHEN** a pauta tem recompensa zero ou está com status `closed`
- **THEN** nenhum crédito é gerado

#### Scenario: Visibilidade para o membro
- **WHEN** uma interação gera crédito
- **THEN** a resposta ao membro informa o valor recebido para que a interface o exiba, e o lançamento aparece no histórico da carteira

