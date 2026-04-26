# Spec - Evidence Capture

## ADDED Requirements

### Requirement: Captura de Foto com Marca d'Água
O sistema **DEVERÁ (SHALL)** permitir que o usuário capture fotos diretamente pelo navegador e adicione automaticamente informações de geolocalização e data/hora na imagem.

#### Scenario: Captura de Foto com Sucesso
- **GIVEN** que o usuário abriu a câmera no formulário de registro de trabalho.
- **WHEN** o usuário clica em "Capturar".
- **THEN** o sistema deve obter a posição GPS atual.
- **THEN** o sistema deve gerar uma imagem com o texto "Tekuá - [Data] [Hora] - Lat: [Lat], Lon: [Lon]" no canto inferior.
- **THEN** a imagem resultante deve ser usada como evidência do trabalho.
