## ADDED Requirements

### Requirement: Gestão de Credenciais no Perfil
O sistema SHALL permitir que o usuário autenticado gerencie suas informações de segurança diretamente em seu perfil.

#### Scenario: Alternar para Aba de Segurança
- **WHEN** o usuário clica na aba "Segurança" na tela de perfil.
- **THEN** o sistema oculta as informações básicas e exibe os controles de segurança (Trocar Senha).

#### Scenario: Alteração de Senha com Sucesso
- **WHEN** o usuário preenche a nova senha e a confirmação corretamente e clica em "Salvar".
- **THEN** o sistema atualiza as credenciais no Supabase Auth e exibe uma mensagem de sucesso.

#### Scenario: Erro de Validação de Senha
- **WHEN** os campos de "Nova Senha" e "Confirmação" não coincidem.
- **THEN** o sistema exibe uma mensagem de erro indicando a divergência e impede o envio do formulário.

#### Scenario: Requisitos de Complexidade
- **WHEN** a nova senha possuir menos de 6 caracteres (padrão Supabase).
- **THEN** o sistema exibe erro informando o requisito mínimo de segurança.
