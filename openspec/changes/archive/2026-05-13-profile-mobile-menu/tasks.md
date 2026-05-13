## 1. Preparation and Constants

- [x] 1.1 Criar a constante `tabOptions` dentro do componente `Profile` para centralizar ícones, rótulos e visibilidade
- [x] 1.2 Configurar o estado do Menu (`anchorEl`) para controle do dropdown mobile

## 2. Profile UI Refactoring

- [x] 2.1 Envolver o componente `Tabs` atual em uma condicional que oculta em telas `xs`
- [x] 2.2 Implementar o botão de menu responsivo que exibe a seção ativa
- [x] 2.3 Implementar o componente `Menu` e `MenuItem` iterando sobre `tabOptions`
- [x] 2.4 Vincular a seleção do menu ao estado `tabValue` e fechar o menu após o clique

## 3. Verification

- [x] 3.1 Validar se as abas continuam aparecendo corretamente no Desktop
- [x] 3.2 Testar a troca de abas via menu mobile emulando um smartphone
- [x] 3.3 Verificar se as abas condicionais (Segurança/Privacidade) são ocultadas corretamente na visão de Admin
