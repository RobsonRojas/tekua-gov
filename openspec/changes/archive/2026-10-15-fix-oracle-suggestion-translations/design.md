# Design: Fix Oracle Suggestion Translations

## Architecture/Component Changes

Modificar os dicionários JSON utilizados pelo `react-i18next`.

O componente `src/pages/AIAgent.tsx` já utiliza o hook `useTranslation()` com as seguintes chaves:
- `ai.suggest.whatIsTekua`
- `ai.suggest.howToEarn`
- `ai.suggest.votingRules`

A biblioteca de tradução está retornando os nomes das chaves devido à falta das chaves nos arquivos de tradução.

## Technical Details

1. **`src/locales/pt/translation.json`**: Adicionar o objeto `ai.suggest` dentro do root (ou de um aninhamento compatível) e inserir as traduções:
   ```json
   "ai": {
     "suggest": {
       "whatIsTekua": "O que é a Associação Tekuá?",
       "howToEarn": "Como posso ganhar Surreais ($S)?",
       "votingRules": "Quais as regras para votações?"
     }
   }
   ```

2. **`src/locales/en/translation.json`**: Fazer a inserção correspondente para inglês.
   ```json
   "ai": {
     "suggest": {
       "whatIsTekua": "What is the Tekuá Association?",
       "howToEarn": "How can I earn Surreals ($S)?",
       "votingRules": "What are the rules for voting?"
     }
   }
   ```

Apenas arquivos estáticos de tradução serão alterados.

## Open Questions

Nenhuma. A modificação é apenas adição de conteúdo estático ao dicionário de i18n.
