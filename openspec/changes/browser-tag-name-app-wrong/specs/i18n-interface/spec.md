## MODIFIED Requirements

### Requirement: Troca dinâmica de idioma (i18n-interface)

O sistema **DEVE (SHALL)** permitir que o usuário alterne entre os idiomas disponíveis (inicialmente PT e EN) sem a necessidade de recarregar a página.

#### Scenario: Seleção de Idioma
- **WHEN** o usuário clica no seletor de idioma na barra superior e escolhe um idioma diferente do atual.
- **THEN** todos os textos estáticos da interface (labels, botões, mensagens de erro) devem ser atualizados imediatamente para o novo idioma.
- **THEN** o título da aba do navegador SHALL ser atualizado para refletir o nome da aplicação no idioma selecionado.
- **THEN** a preferência deve ser persistida localmente (LocalStorage) e, se o usuário estiver logado, opcionalmente sincronizada com o seu perfil.
