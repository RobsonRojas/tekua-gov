## MODIFIED Requirements

### Requirement: Cadastro de Novos Membros
O sistema SHALL permitir que administradores adicionem novos membros à plataforma, fornecendo no mínimo o Nome, Papel (Role) e o Endereço de E-mail. O e-mail **MUST** ser validado e salvo obrigatoriamente no banco de dados para garantir que o membro possa ser contatado e consiga realizar o login posteriormente.

#### Scenario: Cadastro com Sucesso
- **WHEN** o administrador preenche o formulário de "Novo Membro" com Nome, Papel e um E-mail válido e clica em "Salvar".
- **THEN** o sistema SHALL criar o usuário e salvar todos os dados fornecidos, incluindo o e-mail, nas respectivas tabelas do banco de dados (ex: perfis e auth).

#### Scenario: Prevenção de Cadastro Sem E-mail
- **WHEN** o administrador tenta salvar o formulário sem fornecer o E-mail.
- **THEN** o sistema SHALL bloquear a submissão e exibir um aviso de que o E-mail é um campo obrigatório.
