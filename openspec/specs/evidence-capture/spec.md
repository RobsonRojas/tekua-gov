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
