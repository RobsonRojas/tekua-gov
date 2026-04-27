## Why

O portal Tekuá Governance precisa estar em conformidade total com a Lei Geral de Proteção de Dados (LGPD) para garantir a privacidade, transparência e controle dos membros sobre seus dados pessoais. Atualmente, faltam mecanismos formais de consentimento, portabilidade de dados (exportação completa) e o direito ao esquecimento (exclusão de conta), que são requisitos fundamentais da legislação brasileira.

## What Changes

- **Gestão de Consentimento**: Implementar um fluxo de aceitação obrigatória dos Termos de Uso e Política de Privacidade no primeiro acesso ou após atualizações significativas dos termos.
- **Portabilidade de Dados (Exportação LGPD)**: Criar uma funcionalidade no perfil do usuário para exportar todos os dados pessoais e históricos vinculados à sua conta em formato legível por máquina (JSON/CSV).
- **Direito ao Esquecimento**: Adicionar a opção de exclusão definitiva da conta e anonimização/exclusão de dados sensíveis associados, respeitando obrigações legais de retenção (ex: logs de auditoria financeira).
- **Central de Privacidade**: Nova seção nas configurações do perfil para gerenciar preferências de dados e visualizar informações coletadas.

## Capabilities

### New Capabilities
- `lgpd-compliance`: Especificação dos fluxos de consentimento, portabilidade e exclusão de dados sob a lei brasileira.

### Modified Capabilities
- `auth`: Incluir verificação de consentimento durante o fluxo de autenticação.
- `user-profile`: Adicionar interface para exportação de dados e exclusão de conta.

## Impact

Este projeto impactará o fluxo de login, a interface de perfil do usuário e exigirá novas funções de backend (Edge Functions) para processar a agregação de dados para exportação e o processo de deleção segura.
