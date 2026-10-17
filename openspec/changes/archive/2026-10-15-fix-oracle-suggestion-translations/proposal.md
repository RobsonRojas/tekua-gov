## Why

Na página do Oráculo (AIAgent), as opções sugeridas de interação estão sendo exibidas como chaves de tradução cruas (ex: `ai.suggest.whatIsTekua`), em vez do texto legível.
Isso ocorre porque as chaves não estão presentes nos arquivos de localização `src/locales/pt/translation.json` e `src/locales/en/translation.json`, fazendo com que a biblioteca de tradução `react-i18next` retorne a chave bruta, o que contorna o fallback programado `|| 'O que é a Associação Tekuá?'`.

## What Changes

- Adicionar as traduções referentes a `ai.suggest.whatIsTekua`, `ai.suggest.howToEarn` e `ai.suggest.votingRules` aos arquivos `translation.json` para português e inglês.

## Capabilities

### New Capabilities
*(nenhuma)*

### Modified Capabilities
- `oracle-chat`: Sugestões do oráculo serão localizadas de forma apropriada e não exibirão chaves brutas de tradução.

## Impact

- `src/locales/pt/translation.json`
- `src/locales/en/translation.json`
