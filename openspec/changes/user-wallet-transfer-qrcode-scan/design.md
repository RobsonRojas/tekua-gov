## Context

Para facilitar transferências P2P presenciais, a leitura e exibição de QR Codes torna o processo de compartilhamento do identificador da carteira (email) muito mais rápido e imune a erros de digitação. Atualmente, o projeto já possui a dependência `qrcode.react` instalada para geração de códigos QR, mas precisamos de uma interface amigável na tela de carteira para exibir o código do usuário e de uma biblioteca para acessar a câmera e escanear o código de outros.

## Goals / Non-Goals

**Goals:**
- Adicionar um botão "Receber via QR Code" na página da carteira que abre um modal exibindo o QR Code com o email do usuário autenticado.
- Adicionar um botão "Escanear QR Code" na interface de transferência (ou na home da carteira) que ativa a câmera.
- Ao escanear o QR Code de outro membro com sucesso, preencher automaticamente o campo "Destinatário" no modal de transferência e focar no campo de valor.

**Non-Goals:**
- Criar um padrão complexo de URI (como `tekua://transfer?to=X&amount=Y`). Por simplicidade inicial, o QR Code conterá apenas o identificador (email) do recebedor.
- Suporte a leitura de arquivos de imagem de QR Code da galeria (foco inicial será apenas o uso da câmera).

## Decisions

### 1. Padrão do Dado no QR Code
**Decisão**: O QR Code gerado pelo componente `<QRCodeSVG>` do `qrcode.react` conterá estritamente o `email` do usuário logado (ex: `joao@tekua.com`).
**Rationale**: Simples, já compatível com a API `transfer` da Edge Function e com o campo de "Destinatário" recentemente aprimorado.

### 2. Biblioteca de Leitura de QR Code
**Decisão**: Instalar e utilizar a biblioteca `@zxing/browser` ou `html5-qrcode` (ou `react-qr-scanner`/`react-qr-reader` dependendo da compatibilidade com React 19 no projeto). Vamos especificar `html5-qrcode` via um wrapper simples por ser altamente robusto em dispositivos móveis modernos (PWA).
**Rationale**: Leitura de QR code via câmera no navegador requer abstração sobre a API `getUserMedia`. Bibliotecas como `html5-qrcode` são mantidas ativamente e lidam bem com a seleção da câmera traseira em celulares.

### 3. Fluxo de UI
**Decisão**:
- Novo Modal "Meu QR Code": Exibe o avatar, nome e o QR code grandão.
- Modal de Escanear: Substitui temporariamente a visualização por um feed de vídeo. Ao ler o conteúdo (um email válido), fecha o scanner, abre o modal de Transferência P2P e já preenche o autocompletar (ou o state `recipientEmail`) com o email lido.

## Risks / Trade-offs

- **Risk**: Permissão de câmera negada ou dispositivo sem câmera.
  → **Mitigação**: O sistema fará fallback elegante: se houver erro ao acessar a câmera (NotAllowedError), exibir mensagem amigável instruindo o usuário a dar permissão nas configurações do navegador ou usar a busca manual de usuário.
- **Risk**: Compatibilidade com React 19 para algumas libs de QR Code antigas.
  → **Mitigação**: Se bibliotecas empacotadas falharem, podemos usar a API nativa `BarcodeDetector` (ainda limitada em alguns browsers) ou a lib `html5-qrcode` que não depende fortemente do React core.
