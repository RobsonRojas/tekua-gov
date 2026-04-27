## Why

O deploy no Vercel está falhando com o erro `ERESOLVE` devido a um conflito de dependências entre o `react-quill@2.0.0` e o `react@19.1.0`. O `react-quill` possui uma dependência de par (peer dependency) restrita a versões do React até a 18, o que impede a instalação bem-sucedida das dependências em ambientes rigorosos como o Vercel.

## What Changes

- **Configuração de Dependências**: Adicionar configuração para permitir a resolução de dependências legadas (`--legacy-peer-deps`) de forma global no projeto através de um arquivo `.npmrc`.
- **Garantia de Deploy**: Assegurar que o comando `npm install` no Vercel não falhe por conflitos de peer dependencies que são conhecidamente compatíveis ou aceitáveis no momento.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `technical-integrity`: Adicionar requisito de compatibilidade de dependências e resiliência no processo de instalação em ambientes de CI/CD.

## Impact

- `.npmrc`: Criação do arquivo na raiz do projeto com `legacy-peer-deps=true`.
- Processo de Deploy (Vercel): O build passará a ignorar conflitos estritos de peer dependencies.
