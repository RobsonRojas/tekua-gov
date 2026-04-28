# i18n-interface Specification

## Purpose
TBD - created by archiving change permitir-multiplos-idiomas. Update Purpose after archive.
## Requirements
### Requirement: Troca dinâmica de idioma (i18n-interface)

O sistema **DEVE (SHALL)** permitir que o usuário alterne entre os idiomas disponíveis (inicialmente PT e EN) sem a necessidade de recarregar a página.

#### Scenario: Seleção de Idioma
- **WHEN** o usuário clica no seletor de idioma na barra superior e escolhe um idioma diferente do atual.
- **THEN** todos os textos estáticos da interface (labels, botões, mensagens de erro) devem ser atualizados imediatamente para o novo idioma.
- **THEN** o título da aba do navegador SHALL ser atualizado para refletir o nome da aplicação no idioma selecionado.
- **THEN** a preferência deve ser persistida localmente (LocalStorage) e, se o usuário estiver logado, opcionalmente sincronizada com o seu perfil.

### Requirement: Detecção Automática
O sistema **DEVE (MUST)** tentar identificar o idioma preferido do usuário no primeiro acesso.

#### Scenario: Primeiro Acesso
- **WHEN** um novo usuário acessa o portal pela primeira vez.
- **THEN** o sistema lê o cabeçalho `Accept-Language` do navegador ou as configurações de localidade.
- **THEN** se o idioma for suportado, o portal é exibido nesse idioma. Caso contrário, cai no idioma padrão (PT-BR).

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.

### Requirement: Tradução da Aba Financeiro no Painel Admin
Os rótulos e títulos na aba Financeiro do Painel Administrativo **DEVERÃO (SHALL)** ser exibidos no idioma selecionado.

#### Scenario: Exibição da Aba Financeiro em Português
- **GIVEN** que o usuário está no "Painel Admin".
- **WHEN** a aba "Financeiro" é selecionada.
- **THEN** o título da aba na navegação deve ser "Financeiro".
- **THEN** o título da seção deve ser "Integridade Financeira".
- **THEN** a descrição deve ser "Resumo da integridade e balanço do sistema.".
- **THEN** o alerta de sucesso deve mostrar "Sem Discrepâncias".
- **THEN** o botão de atualização deve ser "Atualizar".

### Requirement: Rótulos Corretos no Formulário de Criar Demanda
O campo de descrição no formulário de criação de demanda **DEVERÁ (SHALL)** orientar o usuário a descrever o que precisa ser feito, e não o que ele fez.

#### Scenario: Exibição do Formulário de Criar Demanda
- **GIVEN** que o usuário está na tela de "Criar Demanda".
- **WHEN** o formulário é renderizado.
- **THEN** o rótulo/placeholder do campo de descrição deve ser "Descreva a demanda (o que precisa ser feito)".

### Requirement: Indicador de Idioma Corrente no Botão
O botão de seleção de idiomas **DEVERÁ (SHALL)** exibir visualmente qual é o idioma atualmente ativo na interface.

#### Scenario: Seleção de Idioma Ativo
- **GIVEN** que o idioma da interface é Português.
- **WHEN** o cabeçalho é renderizado.
- **THEN** o botão de troca de idioma deve exibir o texto "PT" ou um ícone de bandeira do Brasil.
- **WHEN** o usuário altera o idioma para Inglês.
- **THEN** o botão deve passar a exibir "EN" ou um ícone de bandeira dos EUA/UK.

### Requirement: Rótulos de Ações Comuns (common-actions)
O sistema **DEVE (SHALL)** fornecer traduções para ações comuns utilizadas em diversos componentes da interface através do namespace `common`.

#### Scenario: Rótulo de Envio em Português
- **GIVEN** que o idioma da interface é Português.
- **WHEN** um componente referencia as chaves `common.send` ou `common.sending`.
- **THEN** o sistema SHALL retornar "Enviar" e "Enviando...", respectivamente.

#### Scenario: Rótulo de Envio em Inglês
- **GIVEN** que o idioma da interface é Inglês.
- **WHEN** um componente referencia as chaves `common.send` ou `common.sending`.
- **THEN** o sistema SHALL retornar "Send" e "Sending...", respectivamente.

