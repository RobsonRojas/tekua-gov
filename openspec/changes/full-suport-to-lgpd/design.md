## Context

Para que o portal Tekuá Governance atenda de forma integral às disposições da Lei Geral de Proteção de Dados (LGPD) brasileira, é necessária a implantação de um sistema robusto de gestão de consentimento, portabilidade e direito ao esquecimento. O fluxo atual de dados deve garantir a proteção de informações pessoais e fornecer ferramentas de autoatendimento para o controle das informações por parte dos membros.

## Goals / Non-Goals

**Goals:**
- **Controle de Consentimento**: Armazenar explicitamente o consentimento dos termos de uso e política de privacidade na tabela `profiles` via os campos `accepted_terms_at` e `terms_version`.
- **Bloqueio por Consentimento**: Exibir modal obrigatório e bloqueante na interface para usuários logados que ainda não aceitaram a versão atual dos termos.
- **Portabilidade de Dados**: Consolidar dados de perfil, contribuições, votos e logs de atividade do usuário logado e fornecer um download estruturado em formato JSON legível por máquina.
- **Direito de Exclusão (Esquecimento)**: Apagar credenciais e informações pessoais sensíveis do usuário, anonimizando dados transacionais e de governança que necessitam ser mantidos para integridade do ledger financeiro e votos da comunidade.

**Non-Goals:**
- Gestão de cookies de rastreamento de terceiros (não aplicável à arquitetura atual).
- Gestão e exclusão física de backups físicos do banco de dados em tempo real.

## Decisions

### 1. Modelo de Consentimento no Banco de Dados
A tabela `profiles` deve conter os seguintes atributos de controle:
- `accepted_terms_at` (TIMESTAMPTZ, null por padrão): Data e hora em que o usuário aceitou os termos pela última vez.
- `terms_version` (TEXT, null por padrão): Versão dos termos aceitos.

No frontend, a validação de consentimento ocorre em nível global da rota protegida. Se o usuário estiver autenticado mas seu `accepted_terms_at` for nulo, um modal bloqueante com os termos será renderizado, impedindo qualquer outra interação.

### 2. Agregação e Exportação de Dados via `api-privacy` (Portabilidade)
Uma ação `exportUserData` no Edge Function `api-privacy` agregará de forma segura:
- Perfil do usuário (`profiles`)
- Contribuições registradas (`contributions`)
- Histórico de votações (`topic_votes`)
- Logs de atividade (`activity_log`)

O backend retornará o payload JSON correspondente, e o frontend acionará o download local no navegador.

### 3. Anonimização e Exclusão Segura (Direito ao Esquecimento)
Ao acionar a exclusão definitiva:
- As informações sensíveis de perfil (e-mail, nome completo, avatar) serão excluídas ou anonimizadas.
- O usuário do Supabase Auth será removido definitivamente via cliente administrativo (`supabaseAdmin.auth.admin.deleteUser`).
- Registros que necessitam permanecer no banco de dados por questões de integridade estrutural (como votos ou transações de carteira) serão mantidos, mas dissociados da identidade do usuário, apontando para valores nulos ou identificadores genéricos ("Membro Anonimizado").

## Risks / Trade-offs

- **[Risco] Deleção em Cascata Indesejada** → A deleção do usuário na tabela de autenticação pode disparar exclusão em cascata em registros de governança (votos, propostas, transferências financeiras), quebrando a consistência do sistema.
  - *Mitigação*: Definir as chaves estrangeiras (`foreign keys`) nessas tabelas críticas como `ON DELETE SET NULL` ou `ON DELETE RESTRICT` para forçar a anonimização e evitar perda de histórico transacional.
- **[Risco] Aceite de Termos em Cache** → Usuários já autenticados que precisam assinar novos termos atualizados podem ter o estado cached no frontend.
  - *Mitigação*: Fazer a comparação de versões diretamente na query de inicialização de perfil no carregamento da aplicação.
