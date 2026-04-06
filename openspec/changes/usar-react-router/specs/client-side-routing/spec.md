## ADDED Requirements

### Requirement: Client-Side Routing (client-side-routing)
O sistema **DEVE (SHALL)** gerenciar a navegação interna de forma assíncrona, sincronizando a interface com a URL do navegador sem recarregar a página.

#### Scenario: Acesso Direto a Rota Protegida
- **WHEN** um usuário autenticado digita a URL `/profile` diretamente na barra de endereços.
- **THEN** o sistema deve carregar a página de Perfil dentro do layout principal.

#### Scenario: Proteção de Rota (Guard)
- **WHEN** um usuário não autenticado tenta acessar a URL `/admin` ou `/home`.
- **THEN** o sistema deve interceptar a requisição e redirecionar o usuário para a página de `/login`.

#### Scenario: Navegação Voltar/Avançar
- **WHEN** o usuário navega da `/home` para o `/profile` e clica no botão "voltar" do navegador.
- **THEN** a interface deve retornar para a `/home` e a URL deve ser atualizada para `/`.
