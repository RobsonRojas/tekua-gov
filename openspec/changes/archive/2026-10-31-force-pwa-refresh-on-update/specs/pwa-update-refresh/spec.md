## Purpose

Define como o Portal Tekuá detecta uma nova versão do Progressive Web App e obriga o usuário a recarregar a aplicação, garantindo que ninguém continue usando um bundle antigo (com falhas corrigidas ou fluxos removidos) depois de um deploy.

## ADDED Requirements

### Requirement: Detecção de Versão Pendente do Service Worker
O sistema SHALL detectar quando uma nova versão do service worker está instalada aguardando ativação e SHALL sinalizar esse estado para a interface assim que ele for identificado.

#### Scenario: Nova versão detectada com a aplicação aberta
- **WHEN** um novo service worker é baixado e instalado enquanto o usuário está com a aplicação aberta
- **THEN** o sistema SHALL sinalizar que existe uma atualização pendente

#### Scenario: Atualização pendente já existente na abertura
- **WHEN** o usuário abre a aplicação e já existe um service worker aguardando ativação por conta de uma atualização baixada em uma sessão anterior
- **THEN** o sistema SHALL sinalizar que existe uma atualização pendente

#### Scenario: Navegador sem suporte a service worker
- **WHEN** o navegador do usuário não suporta service workers
- **THEN** o sistema SHALL funcionar normalmente, sem sinalizar atualização pendente e sem apresentar erro ao usuário

### Requirement: Diálogo Bloqueante de Atualização Obrigatória
Quando existir atualização pendente, o sistema SHALL exibir um diálogo modal sobre a interface inteira, SHALL proibir o descarte (sem fechar por `Esc`, clique fora ou botão de fechar) e SHALL oferecer uma única ação: atualizar a aplicação.

#### Scenario: Atualização obrigatória impede o uso da aplicação
- **WHEN** existe uma atualização pendente
- **THEN** o sistema SHALL exibir o diálogo de atualização sobre o conteúdo da aplicação
- **AND** o usuário SHALL NOT conseguir interagir com o conteúdo exibido atrás do diálogo
- **AND** o diálogo SHALL NOT possuir forma de ser dispensado sem realizar a atualização

#### Scenario: Único caminho de saída é a atualização
- **WHEN** o usuário visualiza o diálogo de atualização
- **THEN** o sistema SHALL apresentar a ação de atualizar a aplicação como única forma de continuar usando o portal

### Requirement: Aplicação da Atualização
Ao confirmar a atualização, o sistema SHALL ativar o service worker pendente, SHALL recarregar a página com a nova versão e SHALL garantir o recarregamento mesmo que a sinalização de controle do novo worker não ocorra.

#### Scenario: Atualização aplicada com sucesso
- **WHEN** o usuário confirma a atualização
- **THEN** o sistema SHALL ativar o novo service worker
- **AND** SHALL recarregar a página com a nova versão

#### Scenario: Ativação sem sinalização de controle ainda recarrega
- **WHEN** o novo service worker é ativado mas a sinalização de controle não é recebida dentro do tempo limite
- **THEN** o sistema SHALL recarregar a página mesmo assim

#### Scenario: Falha ao ativar o service worker
- **WHEN** a ativação do service worker pendente falha
- **THEN** o sistema SHALL recarregar a página mesmo assim, para não deixar o usuário preso em uma versão obsoleta

### Requirement: Preservação de Ações Pendentes no Refresh
Antes de recarregar a aplicação, o sistema SHALL processar as ações enfileiradas offline para que escritas pendentes não sejam perdidas.

#### Scenario: Ação offline enfileirada e atualização simultânea
- **WHEN** existe uma ação enfileirada offline (por exemplo, voto, subscrição de trabalho ou transferência) e há atualização pendente
- **THEN** o sistema SHALL enviar a ação pendente antes de recarregar a aplicação

### Requirement: Mensagem de Atualização Localizada
O diálogo de atualização SHALL apresentar textos no idioma ativo da plataforma, com tradução disponível em português e inglês.

#### Scenario: Interface em português
- **WHEN** o idioma ativo da plataforma é português
- **THEN** o diálogo de atualização SHALL ser apresentado em português

#### Scenario: Interface em inglês
- **WHEN** o idioma ativo da plataforma é inglês
- **THEN** o diálogo de atualização SHALL ser apresentado em inglês
