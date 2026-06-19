## 1. Dependências

- [x] 1.1 Adicionar biblioteca de leitura de QR Code (ex: `html5-qrcode` ou `@zxing/browser`) ao `package.json` utilizando o gerenciador de pacotes (`npm install`).

## 2. Geração do QR Code

- [x] 2.1 Em `Wallet.tsx`, adicionar estado `openQrModal` para controlar a exibição do QR Code do usuário.
- [x] 2.2 Adicionar botão "Meu QR Code" (ícone de QR) próximo ao botão de Transferência.
- [x] 2.3 Implementar o componente `Dialog` que renderiza o `<QRCodeSVG>` contendo o `user.email` (se disponível), juntamente com o avatar e nome do usuário.

## 3. Leitura do QR Code (Scanner)

- [x] 3.1 Em `Wallet.tsx`, adicionar estado `openScannerModal` para controlar a exibição da câmera.
- [x] 3.2 Adicionar botão "Escanear" no modal de Transferência P2P (ou na tela principal) para abrir o scanner.
- [x] 3.3 Criar o componente de interface que renderiza o feed de vídeo da câmera e processa a leitura utilizando a biblioteca escolhida.
- [x] 3.4 Implementar lógica de fallback para exibir mensagem amigável caso a permissão da câmera seja negada.

## 4. Integração Fluxo P2P

- [x] 4.1 Ao obter sucesso na leitura do QR Code (um email válido), fechar automaticamente o modal do scanner.
- [x] 4.2 Abrir automaticamente (se já não estiver aberto) o modal de Transferência P2P.
- [x] 4.3 Preencher o campo de destinatário (`recipientEmail` ou o autocomplete) com o valor lido do QR Code.
- [x] 4.4 Garantir que o preenchimento não engatilhe transferências acidentais (o usuário ainda deve digitar o valor e confirmar).

## 5. Testes e Validação

- [x] 5.1 Abrir a tela "Meu QR Code" e verificar se o código gerado contém o email correto lendo com o app de câmera nativo do celular.
- [x] 5.2 Abrir o Scanner na aplicação e apontar para um QR Code contendo um email, verificando se a captura preenche corretamente o formulário.
- [x] 5.3 Simular recusa de permissão de câmera e verificar o tratamento de erro.
