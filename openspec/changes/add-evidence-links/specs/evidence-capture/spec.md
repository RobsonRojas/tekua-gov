## ADDED Requirements

### Requirement: Links clicáveis como evidência
O sistema SHALL permitir que o membro adicione links como evidência de uma tarefa ou demanda, nos formulários de registro de trabalho e de conclusão de tarefa, além de fotos e documentos. Somente endereços `http` e `https` SHALL ser aceitos.

#### Scenario: Adicionar um link válido
- **WHEN** o membro informa um endereço `https://...` no campo de links e o adiciona
- **THEN** o link SHALL aparecer na lista de evidências do formulário
- **AND** ao enviar, o link SHALL ser gravado junto às demais evidências da atividade

#### Scenario: Link com protocolo não permitido
- **WHEN** o membro informa um endereço com protocolo diferente de `http` ou `https`, como `javascript:` ou `data:`
- **THEN** o formulário SHALL recusar o endereço e informar o motivo
- **AND** o servidor SHALL recusar o envio se receber esse endereço, sem gravar nada

#### Scenario: Link exibido como item clicável
- **WHEN** a atividade possui uma evidência do tipo link
- **THEN** a lista de evidências SHALL exibir o link como item clicável que abre em outra aba
- **AND** o link SHALL abrir sem acesso à página de origem (`noopener noreferrer`)

#### Scenario: Evidência continua opcional
- **WHEN** o membro envia o formulário sem arquivos e sem links
- **THEN** o envio SHALL ser aceito normalmente
