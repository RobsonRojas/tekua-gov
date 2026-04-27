# Spec - i18n-interface

## ADDED Requirements

### Requirement: Tradução da Aba Financeiro no Painel Admin
Os rótulos e títulos na aba Financeiro do Painel Administrativo **DEVERÃO (SHALL)** ser exibidos no idioma selecionado.

#### Scenario: Exibição da Aba Financeiro em Português
- **GIVEN** que o usuário está no "Painel Admin".
- **WHEN** a aba "Financeiro" é selecionada.
- **THEN** o título da aba na navegação deve ser "Financeiro".
- **THEN** o título da seção deve ser "Integridade Financeira".
- **THEN** a descrição deve ser "Resumo da integridade e balanço do sistema.".
- **THEN** o alerta de sucesso deve mostrar "Sem Discrepâncias".
- **THEN** o botão de atualização deve ser "Atualizar".
