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

