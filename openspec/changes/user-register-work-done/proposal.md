## Why

O sistema Tekuá Governance precisa de uma forma de descentralizar o reconhecimento de contribuições e a distribuição da moeda social **Surreal**. Atualmente, a emissão depende de ações administrativas manuais. 

Ao permitir que os próprios membros registrem o trabalho realizado (auto-atestação) e que a comunidade valide essas ações, promovemos uma economia de dádiva mais fluida, transparente e menos dependente de uma autoridade central, fortalecendo o engajamento e a confiança entre os membros da Vila.

## What Changes

- **Formulário de Registro de Trabalho**: Uma nova interface onde qualquer usuário pode descrever uma tarefa concluída, anexar evidências (links, fotos, documentos) e sugerir o valor em Surreais a ser recebido.
- **Destinação da Contribuição**: Opção para indicar se o beneficiário do trabalho foi a própria associação Tekuá ou membros específicos.
- **Mural de Validação**: Uma lista pública de tarefas registradas aguardando confirmação. Outros membros podem visualizar as evidências e "confirmar" que o trabalho foi realizado satisfatoriamente.
- **Configuração de Governança**: Administradores poderão definir no painel de controle o número mínimo de confirmações únicas (threshold) necessárias para que uma tarefa seja considerada "validada".
- **Automação de Pagamento**: Integração com o sistema de carteira (`wallets`) para que, assim que o threshold de confirmações for atingido, os Surreais sejam automaticamente transferidos da Tesouraria para o autor do trabalho.

## Capabilities

### New Capabilities
- `work-registration`: Interface e lógica para submissão de tarefas realizadas com suporte a evidências e sugestão de valor.
- `community-validation`: Sistema de votos/confirmações sociais para validação de contribuições de terceiros.
- `governance-payout-automation`: Motor de regras que executa transferências automáticas via RPC assim que as condições de validação são atendidas.
- `admin-governance-config`: Painel para configuração dos parâmetros de validação (mínimo de confirmações).

### Modified Capabilities
- `wallet-system`: Extensão para suportar pagamentos automáticos originados por regras de governança, além das transferências manuais e minting administrativo.

## Impact

- **Banco de Dados**: Novas tabelas `contributions` e `contribution_confirmations`.
- **API**: Novos endpoints/funções RPC para submeter contribuições e registrar votos de validação.
- **UI**: Integração no Dashboard e criação de páginas específicas para "Registrar Trabalho" e "Validar Contribuições".
- **Economia**: Aumento da circulação de Surreais baseado em mérito social comprovado.
