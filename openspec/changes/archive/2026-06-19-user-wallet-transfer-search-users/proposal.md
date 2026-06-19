## Why

Atualmente, ao realizar uma transferência de Surreais, o usuário pode não ter uma interface clara e segura para encontrar e selecionar o destinatário. Permitir a pesquisa e seleção de usuários diretamente na interface de transferência de carteira torna o processo mais fluido e menos sujeito a erros (como enviar para o endereço errado).

## What Changes

- A interface de transferência de Surreais passará a exibir um componente de busca e seleção de usuários.
- O campo de destinatário deixará de ser apenas uma entrada manual (ou ganhará um autocompletar baseado em membros reais).
- O backend (`api-members` ou `api-wallet`) será utilizado para listar usuários disponíveis para recebimento, garantindo que usuários com papel de `member` ou `admin` possam buscar destinatários.
- A experiência de usuário durante o processo de envio ficará mais intuitiva.

## Capabilities

### New Capabilities
<!-- Nenhuma nova capability, aprimoramento da existente -->

### Modified Capabilities
- `wallet-system`: A requirement for user search/selection during P2P transfers is being added to improve the transfer experience.

## Impact

- **Affected code**: Componentes de frontend da interface de transferência (formulário de envio de moedas).
- **APIs**: Uso da API de busca de usuários (Edge Function `api-members`).
- **Dependencies**: Nenhuma nova dependência externa prevista.
