# evidence-capture Specification

## Purpose
Garantir a coleta de evidências confiáveis para o registro de trabalhos e tarefas, facilitando a validação e auditoria através de mídias digitais.

## Requirements

### Requirement: Captura de Foto com Marca d'Água
O sistema **DEVERÁ (SHALL)** permitir que o usuário capture fotos diretamente pelo navegador e adicione automaticamente informações de geolocalização e data/hora na imagem.

#### Scenario: Captura de Foto com Sucesso
- **GIVEN** que o usuário abriu a câmera no formulário de registro de trabalho.
- **WHEN** o usuário clica em "Capturar".
- **THEN** o sistema deve obter a posição GPS atual.
- **THEN** o sistema deve gerar uma imagem com o texto "Tekuá - [Data] [Hora] - Lat: [Lat], Lon: [Lon]" no canto inferior.

### Requirement: Upload de Documentos como Evidência
O sistema SHALL permitir que o usuário faça upload de documentos (PDF, DOCX, XLSX) como parte do conjunto de evidências de uma tarefa, além das fotos capturadas.

#### Scenario: Upload de PDF como evidência
- **WHEN** o usuário seleciona um arquivo PDF em vez de capturar uma foto.
- **THEN** o sistema SHALL permitir o upload e associar o arquivo à tarefa como evidência válida.

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
