# ai-chat-history Specification

## Purpose
Permitir salvar e carregar o histórico de conversação do usuário logado no banco de dados para continuidade do chat.
## Requirements
### Requirement: Persistência do Histórico do Chat
O sistema SHALL armazenar as mensagens do chat da IA vinculadas à conta do usuário no Supabase. O frontend SHALL carregar o histórico de conversas passadas na inicialização do componente do Oráculo.

#### Scenario: Carregamento do histórico existente
- **WHEN** o usuário abre a interface do Oráculo
- **THEN** o sistema carrega e exibe as mensagens da última sessão armazenada no banco de dados

#### Scenario: Salvamento de novas mensagens
- **WHEN** o usuário ou a IA enviam uma nova mensagem
- **THEN** o sistema salva a mensagem no banco de dados vinculada à sessão/usuário atual

