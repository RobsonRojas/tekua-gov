# Spec - i18n-interface

## MODIFIED Requirements

### Requirement: Rótulos Corretos no Formulário de Criar Demanda
O campo de descrição no formulário de criação de demanda **DEVERÁ (SHALL)** orientar o usuário a descrever o que precisa ser feito, e não o que ele fez.

#### Scenario: Exibição do Formulário de Criar Demanda
- **GIVEN** que o usuário está na tela de "Criar Demanda".
- **WHEN** o formulário é renderizado.
- **THEN** o rótulo/placeholder do campo de descrição deve ser "Descreva a demanda (o que precisa ser feito)".
