# lgpd-compliance Specification

## Purpose
TBD - created by archiving change full-support-to-lgpd. Update Purpose after archive.

## Requirements

### Requirement: Consentimento de Privacidade
O sistema SHALL exigir que todo usuário aceite expressamente os Termos de Uso e a Política de Privacidade antes de acessar as funcionalidades da plataforma.

#### Scenario: Aceitação no Primeiro Login
- **GIVEN** que um novo usuário acabou de se cadastrar ou fazer o primeiro login.
- **WHEN** o sistema detecta que o campo `accepted_terms_at` está vazio.
- **THEN** o sistema SHALL exibir um modal bloqueante com os termos e política de privacidade.
- **WHEN** o usuário clica em "Aceito".
- **THEN** o sistema registra a data e a versão atual dos termos no perfil do usuário e libera o acesso.

### Requirement: Portabilidade de Dados Pessoais
O sistema SHALL permitir que o usuário solicite e receba uma cópia de todos os seus dados pessoais armazenados.

#### Scenario: Solicitação de Exportação de Dados
- **WHEN** o usuário clica em "Exportar Meus Dados" nas configurações de privacidade.
- **THEN** o sistema SHALL gerar um arquivo JSON contendo dados de perfil, histórico de contribuições, votos e logs de atividade vinculados ao seu ID.
- **THEN** o sistema inicia o download automático do arquivo.

### Requirement: Direito ao Esquecimento (Exclusão)
O sistema SHALL prover um mecanismo para que o usuário solicite a exclusão de sua conta e dados pessoais.

#### Scenario: Exclusão de Conta pelo Usuário
- **WHEN** o usuário clica em "Excluir Minha Conta" e confirma a ação.
- **THEN** o sistema SHALL remover todos os dados de identificação pessoal (nome, email, avatar).
- **THEN** o sistema SHALL anonimizar registros vinculados que precisam ser mantidos por integridade (votos, transações).
- **THEN** o acesso do usuário SHALL ser revogado imediatamente.
