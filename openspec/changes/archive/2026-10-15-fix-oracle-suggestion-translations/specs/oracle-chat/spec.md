# oracle-chat (Delta Spec)

## Overview

Corrigir as sugestões do Oráculo exibindo corretamente o texto em vez das chaves de tradução.

## Component: Oracle Chat Sugestions

### Context

As sugestões apresentadas ao iniciar o chat do oráculo dependem do hook `useTranslation`. Quando as chaves não existem no dicionário de traduções, a interface exibe as próprias chaves em vez das strings literais.

### Delta: Translations

- **Comportamento Atual:** Sugestões são exibidas como `ai.suggest.whatIsTekua`.
- **Novo Comportamento:** Sugestões de mensagens serão traduzidas a partir do dicionário. 
- **Chaves Adicionadas:**
  - `ai.suggest.whatIsTekua`: "O que é a Associação Tekuá?" (PT), "What is the Tekuá Association?" (EN).
  - `ai.suggest.howToEarn`: "Como posso ganhar Surreais ($S)?" (PT), "How can I earn Reais ($S)?" (EN).
  - `ai.suggest.votingRules`: "Quais as regras para votações?" (PT), "What are the voting rules?" (EN).
