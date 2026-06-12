## ADDED Requirements

### Requirement: Exibição de QR Code de Recebimento
O sistema SHALL permitir que o usuário autenticado gere e visualize um QR Code contendo o identificador de sua carteira (email) para facilitar o recebimento de transferências presenciais.

#### Scenario: Visualização do próprio QR Code
- **WHEN** o usuário clica no botão "Receber" ou "Meu QR Code" na interface da carteira
- **THEN** o sistema SHALL exibir um modal com o QR Code nítido contendo o email do usuário e seu avatar.

### Requirement: Leitura de QR Code para Transferência
O sistema SHALL permitir o uso da câmera do dispositivo para escanear um QR Code de outro usuário e preencher automaticamente o destinatário na interface de transferência P2P.

#### Scenario: Escaneamento bem sucedido
- **WHEN** o usuário clica em "Escanear QR Code" e aponta a câmera para o QR Code de outro membro
- **THEN** o sistema SHALL ler o código, fechar o feed de vídeo, abrir o formulário de transferência e preencher o campo "Destinatário" automaticamente com o dado lido.

#### Scenario: Permissão de câmera negada
- **WHEN** o usuário clica em "Escanear QR Code" mas o navegador ou sistema operacional bloqueia o acesso à câmera
- **THEN** o sistema SHALL exibir uma mensagem amigável instruindo o usuário a conceder permissão ou a utilizar a busca/digitação manual.
