## Why

Garantir conformidade total com a Lei Geral de Proteção de Dados (LGPD) no portal Tekuá, assegurando o controle, a transparência e a privacidade dos dados de todos os membros. A implementação abordará a portabilidade de dados pessoais, gestão ativa de consentimento de privacidade e termos de uso, bem como a implementação completa do direito ao esquecimento através da exclusão e anonimização de dados.

## What Changes

- **Aceite de Termos e Consentimento**: Exigência de aceite explícito dos Termos de Uso e Política de Privacidade antes de acessar os recursos da plataforma, com bloqueio em tela caso o consentimento não tenha sido concedido.
- **Portabilidade de Dados (Exportação Completa)**: Central de Privacidade nas configurações de perfil para permitir o download automático de um arquivo JSON estruturado contendo todos os dados do usuário.
- **Exclusão de Conta e Anonimização**: Funcionalidade para que o usuário exclua definitivamente sua conta, resultando na remoção de dados de identificação pessoal e anonimização segura de registros históricos.
- **Prevenção de Fugas de Dados**: Proteção de dados sensíveis e auditoria de acesso.

## Capabilities

### New Capabilities

<!-- Nenhuma nova capability, modificaremos a existente lgpd-compliance -->

### Modified Capabilities

- `lgpd-compliance`: Atualizar a especificação para detalhar a validação do consentimento de termos, fluxo de exportação e a deleção/anonimização em todo o ecossistema.

## Impact

- **Frontend**: Componentes de bloqueio de termos (modais), tela de perfil de usuário com aba de privacidade (exportação de dados e exclusão de conta).
- **Backend / Edge Functions**: API de privacidade (`api-privacy`) para exportação e processamento de exclusão/anonimização.
- **Banco de Dados / RLS**: Políticas de segurança para ocultar dados excluídos e garantir consistência na integridade referencial após anonimização.
