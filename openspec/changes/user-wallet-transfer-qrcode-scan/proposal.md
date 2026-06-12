## Why

O processo de transferência de Surreais entre usuários presenciais pode ser ainda mais rápido e fluido. Permitir que um usuário exiba um QR Code com suas informações de recebimento (ex: email) e que outro usuário possa escanear esse QR Code usando a câmera do dispositivo acelera as transações "peer-to-peer" presenciais e praticamente zera a chance de enviar os fundos para a pessoa errada.

## What Changes

- A carteira (`Wallet.tsx`) passará a ter um botão "Receber" que exibe um QR Code (contendo o email ou identificador do usuário logado).
- O modal de transferência (ou a página da carteira) passará a ter um botão "Escanear QR Code".
- Será adicionado um componente de leitura de QR Code utilizando a câmera do dispositivo, que preencherá automaticamente o destinatário na tela de transferência ao realizar a leitura com sucesso.
- **Dependência**: Será necessário instalar uma biblioteca de leitura de QR Code (ex: `react-qr-reader` ou similar) e geração de QR Code (ex: `qrcode.react`).

## Capabilities

### New Capabilities
- Nenhuma nova.

### Modified Capabilities
- `wallet-system`: Os requisitos de Transferência P2P passarão a incluir a capacidade de gerar um QR Code de recebimento e escanear um QR Code para iniciar uma transferência presencial.

## Impact

- **Affected code**: `src/pages/Wallet.tsx` (novos botões e modais para exibir/escanear QR Code).
- **APIs**: Sem alterações nas APIs do backend.
- **Dependencies**: Novas dependências no frontend para gerar (`qrcode.react`) e ler (`react-qr-scanner` ou similar) QR Codes.
- **Permissions**: O navegador solicitará permissão de acesso à câmera ao tentar escanear o QR Code.
