## ADDED Requirements

### Requirement: Ação de Troca de Senha no Painel de Membros
O painel de gerenciamento de membros SHALL exibir, para cada usuário, um botão para enviar o e-mail de troca de senha, visível apenas para administradores. O botão SHALL ficar desabilitado enquanto o envio estiver em andamento e SHALL exibir o resultado da operação.

#### Scenario: Botão disponível ao administrador
- **WHEN** um administrador visualiza a lista de membros.
- **THEN** cada linha apresenta a ação "Enviar e-mail de troca de senha".

#### Scenario: Prevenção de duplo clique
- **WHEN** o administrador aciona o envio e a requisição ainda está em andamento.
- **THEN** o botão daquela linha permanece desabilitado até o término, evitando e-mails duplicados.

## MODIFIED Requirements

### Requirement: Convite de Novos Membros
O sistema SHALL permitir que administradores adicionem novos membros à plataforma, fornecendo no mínimo o Nome, Papel (Role) e o Endereço de E-mail. O e-mail **MUST** ser validado e salvo obrigatoriamente no banco de dados para garantir que o membro possa ser contatado e consiga realizar o login posteriormente. Após o cadastro, o sistema SHALL enviar ao membro um e-mail para finalizar o cadastro e configurar a senha.

#### Scenario: Cadastro com Sucesso
- **WHEN** o administrador preenche o formulário de "Novo Membro" com Nome, Papel e um E-mail válido e clica em "Salvar".
- **THEN** o sistema SHALL criar o usuário, salvar todos os dados fornecidos, incluindo o e-mail, nas respectivas tabelas do banco de dados (ex: perfis e auth) e enviar ao membro o e-mail de finalização de cadastro e configuração de senha.

#### Scenario: Prevenção de Cadastro Sem E-mail
- **WHEN** o administrador tenta salvar o formulário sem fornecer o E-mail.
- **THEN** o sistema SHALL bloquear a submissão e exibir um aviso de que o E-mail é um campo obrigatório.
