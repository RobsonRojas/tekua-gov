## Why

A Associação Tekuá possui uma estrutura de governança, estatutos, conceitos, idéias e serviços que podem ser complexos para novos membros ou para consultas rápidas. Implementar um agente de inteligência artificial capaz de "ler" e "entender" toda a documentação da plataforma permite que os membros tirem dúvidas, aprendam sobre os processos, conceitos, idéias e recebam orientações em linguagem natural, aumentando a transparência e a autonomia.

## What Changes

Implementar o Agente Tekuá IA:
1.  Integração com a API do Google Gemini.
2.  Criação de um componente de chat flutuante ou página dedicada (`src/pages/AIAgent.tsx`).
3.  Desenvolvimento de um fluxo de RAG (Retrieval-Augmented Generation) básico ou Context Injection onde o agente recebe o conteúdo dos documentos oficiais registrados (tabela `documents`) como contexto para as respostas.
4.  Definição de uma "Persona" para o agente (orientador, facilitador e instrutor do ecossistema Tekuá).

## Capabilities

### New Capabilities
- `ai-guidance`: Agente de IA baseado em Gemini que fornece suporte e orientações fundamentadas nos documentos institucionais da Tekuá.

### Modified Capabilities
- None

## Impact

- `src/pages/AIAgent.tsx`: Nova interface de conversação.
- `src/lib/gemini.ts`: Configuração do SDK da Google Generative AI.
- `AuthContext.tsx`: Identificação do usuário para o agente (personalização).
- `translation.json`: Termos de interface do chat e mensagens de boas-vindas.
- `.env`: Necessidade de `VITE_GEMINI_API_KEY`.
