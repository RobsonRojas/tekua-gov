## Why

Quem usa o Registro de Trabalho (tarefa avulsa, sem demanda prévia) não é avisado do que acontece depois do envio. O trabalho não passa pelas colunas Aberta nem Em Execução: ele entra direto na coluna "Para Validar", onde aguarda a confirmação dos validadores. Sem esse aviso, o membro procura o trabalho na coluna errada ou acha que ele se perdeu.

## What Changes

- Exibir, no formulário de Registro de Trabalho, um aviso informando que, após o envio e a aprovação, o trabalho vai diretamente para a coluna "Para Validar" do Mural.
- O aviso fica visível antes do envio, acima dos botões de ação, nos idiomas pt e en.
- Nenhuma mudança no fluxo: o status inicial continua sendo aguardando validação.

## Capabilities

### New Capabilities
- (nenhuma)

### Modified Capabilities
- `work-registration`: o formulário de registro passa a informar o destino do trabalho registrado.

## Impact

- `src/pages/RegisterWork.tsx`: um `Alert` informativo.
- `src/locales/pt/translation.json` e `src/locales/en/translation.json`: uma chave nova em cada.
- Sem mudança de API, banco ou dependências.
