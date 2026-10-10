## Context

A implementação original do Oráculo confia em funções `replace` do JS e padrões Regex rudimentares para segurança. A segurança em aplicações para LLMs deve ser tratada ativando Safety Settings (Gemini) e definindo regras claras no System Prompt. As garantias contra a execução de scripts do lado do cliente (XSS) devem vir do próprio frontend e não do backend.

## Goals / Non-Goals

**Goals:**
- Centralizar o bloqueio de injeções (prompt injection) usando configurações nativas do provedor Gemini.
- Centralizar o bloqueio de XSS no renderizador final no frontend (ex. via DOMPurify).

**Non-Goals:**
- Bloquear conteúdo inofensivo; manteremos a taxa de recusa baixa para falsos positivos.

## Decisions

**Remoção do Sanitizador embutido e Regex:**
- *Decisão:* Remover as expressões regulares contra prompt injections e a sanitização XSS tosca em `ai-handler`.
- *Alternativa:* Manter as expressões e combiná-las com a IA. Foi descartado pois regras baseadas em string limitam o usuário e são custosas.

**Uso de Safety Settings na SDK Gemini:**
- *Decisão:* Adicionar os campos `safetySettings` definindo HARM_CATEGORIES para `BLOCK_MEDIUM_AND_ABOVE`.

## Risks / Trade-offs

- [Bloqueios não intencionais] → Evitar configurar bloqueios no nível MAXIMO (`BLOCK_LOW_AND_ABOVE`), pois isso pode barrar partes válidas do Estatuto Tekuá.
