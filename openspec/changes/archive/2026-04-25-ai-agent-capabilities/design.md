## Context

Atualmente, o Agente IA usa apenas o `system_prompt` com contexto de documentos. Para expandir para dados dinâmicos, usaremos a funcionalidade de "Function Calling" (Tools) do Gemini 1.5 Flash.

## Goals / Non-Goals

**Goals:**
- Implementar as primeiras 3 ferramentas: `get_user_balance`, `get_activity_history`, `check_voting_results`.
- Garantir que a execução das ferramentas respeite o RLS do Supabase (usar o token do usuário).
- Fornecer feedback visual no chat quando uma ferramenta estiver sendo executada.

**Non-Goals:**
- Permitir que a IA execute ações de escrita (transferências, votos) nesta fase.
- Implementar ferramentas complexas que exigem processamento pesado no servidor.

## Decisions

### 1. Loop de Execução no Proxy (Edge Function)
- **Racional**: Para manter a segurança, a lógica de execução das ferramentas ficará na Edge Function, não no frontend. O proxy receberá a chamada da ferramenta do LLM, executará a query no Supabase e retornará o resultado para o LLM gerar a resposta final.
- **Fluxo**: Frontend -> Proxy -> LLM (pede tool) -> Proxy (executa tool) -> LLM (gera texto) -> Frontend.

### 2. Mapeamento de Ferramentas
As ferramentas serão definidas como um array de objetos JSON seguindo o padrão da API do Google AI Studio.
- `get_user_balance`: Chama a função RPC `get_available_balance`.
- `get_activity_history`: Consulta a tabela `activities` filtrando pelo `worker_id`.

### 3. Segurança e Escopo
- Cada ferramenta usará o `auth.uid()` do usuário autenticado para garantir que a IA não acesse dados de terceiros indevidamente.
- As ferramentas serão estritamente de "leitura" nesta versão.

## Risks / Trade-offs

- **[Risco] Alucinação em Chamadas de Ferramentas** → **[Mitigação]** Validação rigorosa dos argumentos recebidos na Edge Function antes da execução da query.
- **[Risco] Latência Adicional** → **[Mitigação]** Como o processo exige múltiplos saltos (Proxy <-> LLM), usaremos streaming para as respostas finais para melhorar a percepção de velocidade.
