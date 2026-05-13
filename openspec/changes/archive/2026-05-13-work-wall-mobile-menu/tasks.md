## 1. UI Preparation and Components

- [x] 1.1 Identificar os rótulos de status atuais para uso no Menu mobile
- [x] 1.2 Implementar o estado de controle do Menu (anchor element) no componente `WorkWall`
- [x] 1.3 Adicionar o hook `useTheme` e `useMediaQuery` se ainda não estiverem configurados para detecção de mobile no `WorkWall.tsx`

## 2. Work Wall Refactoring

- [x] 2.1 Envolver o componente `Tabs` atual em um `Box` ou condicional que oculta em telas `xs`
- [x] 2.2 Implementar o componente de Menu Contextual (botão + `Menu` MUI) para visualização mobile
- [x] 2.3 Vincular a seleção do item de menu ao estado `tabIndex` existente para manter a lógica de filtragem
- [x] 2.4 Ajustar o estilo do botão de menu para que exiba o status ativo (ex: "Status: Em Execução")

## 3. Consistency and Verification

- [x] 3.1 Verificar se a rolagem das abas no Desktop continua funcionando sem regressões
- [x] 3.2 Testar a transição de estados via menu mobile emulando diferentes tamanhos de tela
- [x] 3.3 Validar que o fechamento do menu ocorre imediatamente após a seleção de uma categoria
