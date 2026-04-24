## Context

A Associação Tekuá possui uma estrutura complexa de governança e economia. Ter um agente de IA especializado que conheça os estatutos e as regras da associação ajuda a democratizar a informação e reduzir a carga de trabalho dos administradores em responder dúvidas repetitivas.

## Goals / Non-Goals

**Goals:**
- Integrar a API do Google Gemini (Generative AI) ao portal.
- Prover um agente de conversação que responde com base nos documentos institucionais.
- Oferecer uma página dedicada para interação com a IA (`/ai-agent`).
- Garantir que o agente siga as diretrizes e regras atuais da plataforma.

**Non-Goals:**
- Execução de ações em nome do usuário (ex: "votar para mim").
- Respostas sobre temas fora do escopo da Tekuá.

## Decisions

- **LLM Engine**: Google Gemini 1.5 Flash (devido ao contexto de janela grande e custo-benefício).
- **RAG / Context**: Inserir o resumo dos principais documentos (Estatuto, Manuais) no `system_instruction` do modelo. Os textos serão buscados da tabela `documents`.
- **Backend Architecture**: Toda a comunicação com o Gemini deve ser feita via **Supabase Edge Function** (`ai-handler`). Isso garante que a API Key não seja exposta ao frontend e permite o uso de streaming seguro.
- **UI Architecture**: Interface de chat moderna, com histórico de mensagens na sessão atual.

## Risks / Trade-offs

- **Hallucinations**: A IA pode inventar regras se o contexto não for claro. Deve haver um disclaimer informando que o agente é experimental.
- **Privacy**: Mensagens enviadas para o Gemini devem ser anonimizadas de dados sensíveis dos membros.
- **API Costs**: O uso intensivo da API do Gemini pode gerar custos. Será necessário implementar um limite de mensagens por usuário e por dia.
