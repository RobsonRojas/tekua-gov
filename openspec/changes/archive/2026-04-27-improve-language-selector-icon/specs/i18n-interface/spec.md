# Spec - i18n-interface

## MODIFIED Requirements

### Requirement: Indicador de Idioma Corrente no Botão
O botão de seleção de idiomas **DEVERÁ (SHALL)** exibir visualmente qual é o idioma atualmente ativo na interface.

#### Scenario: Seleção de Idioma Ativo
- **GIVEN** que o idioma da interface é Português.
- **WHEN** o cabeçalho é renderizado.
- **THEN** o botão de troca de idioma deve exibir o texto "PT" ou um ícone de bandeira do Brasil.
- **WHEN** o usuário altera o idioma para Inglês.
- **THEN** o botão deve passar a exibir "EN" ou um ícone de bandeira dos EUA/UK.
