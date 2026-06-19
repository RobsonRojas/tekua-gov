## 1. Implementação da Busca de Usuários

- [x] 1.1 Na página `Wallet.tsx`, adicionar estado para controlar a lista de usuários buscada via API (`users`) e estado de loading da busca (`usersLoading`).
- [x] 1.2 Implementar função assíncrona (ex: `fetchAvailableUsers`) que invoca `apiClient.invoke('api-members', 'fetchUsers')` para preencher o estado `users` quando o modal de transferência for aberto.
- [x] 1.3 Adicionar lógica para remover o próprio usuário (remetente) da lista de opções, garantindo que não seja possível transferir Surreais para si mesmo.

## 2. Atualização da Interface de Transferência

- [x] 2.1 Substituir o componente `TextField` de Destinatário (`recipientEmail`) por um componente `Autocomplete` do Material-UI.
- [x] 2.2 Configurar o `Autocomplete` para utilizar a lista de `users` e renderizar opções customizadas (Avatar, Nome e Email).
- [x] 2.3 Atualizar a lógica do evento `onChange` do `Autocomplete` para definir o estado `recipientEmail` com base no email do usuário selecionado.
- [x] 2.4 Manter o estado do formulário (`recipientEmail`) vazio caso a seleção seja cancelada no `Autocomplete`.

## 3. Testes e Validação

- [x] 3.1 Garantir que o formulário de transferência não permita o envio se nenhum usuário válido for selecionado.
- [x] 3.2 Verificar visualmente se a listagem de opções exibe corretamente as informações (avatar, nome, email).
- [x] 3.3 Validar que o fluxo da requisição de transferência (`handleTransfer`) funciona corretamente com a nova forma de input do email.
