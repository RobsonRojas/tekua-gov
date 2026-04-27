# Walkthrough - Improve Language Selector Icon

O seletor de idiomas foi aprimorado para fornecer uma indicação clara do idioma ativo e uma aparência mais premium.

## Mudanças

### 1. Componente `LanguageSelector`
- Refatorado de um simples `IconButton` para um `Button` estilo "pill".
- Agora exibe o código do idioma atual (ex: "PT" ou "EN") ao lado do ícone de globo.
- Adicionada uma borda sutil e fundo translúcido para destacar o seletor.
- Adicionado ícone de seta (`ChevronDown`) para indicar que se trata de um menu.

### 2. Integração Global
- O componente `LanguageSelector` foi integrado na `Sidebar` (barra lateral) e no `MobileDrawer` (menu mobile), substituindo as implementações ad-hoc de troca de idioma.
- Isso garante que a melhoria visual e funcional esteja disponível em todas as áreas do sistema.

## Resultados da Verificação
- Verificado via subagente de navegação que o botão exibe corretamente "PT" e muda para "EN" ao selecionar inglês.
- O design está alinhado com a estética premium do portal.
- O seletor funciona corretamente tanto no desktop quanto em dispositivos móveis.
