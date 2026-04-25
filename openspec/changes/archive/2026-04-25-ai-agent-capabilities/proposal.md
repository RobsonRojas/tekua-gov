## Why

O Assistente IA atual é limitado a responder perguntas baseadas em documentos estáticos. Para ser um verdadeiro agente, ele precisa de capacidades (Tool Use) para consultar dados dinâmicos da plataforma, como saldos de usuários, status de tarefas e resultados de votações, proporcionando uma assistência muito mais contextual e útil.

## What Changes

- **Integração de Tool Use (Function Calling)**: Capacidade de o modelo de IA invocar funções específicas para consultar o banco de dados.
- **Novas Ferramentas Seguras**: Implementação de funções para consulta de saldo, histórico de atividades e status de propostas.
- **Monitoramento de Uso**: Registro de quais ferramentas foram usadas em cada sessão para fins de auditoria e depuração.

## Capabilities

### New Capabilities
- `ai-tool-executor`: Mecanismo para mapear chamadas de função da IA para consultas seguras no Supabase.
- `ai-governance-tools`: Conjunto de ferramentas específicas para interação com o ecossistema de governança Tekua.

### Modified Capabilities
- `ai-secure-proxy`: O proxy agora deve gerenciar não apenas texto, mas também a ida e volta de chamadas de ferramentas.

## Impact

- **Backend**: Novos endpoints ou funções no `ai-handler` para lidar com a execução de ferramentas.
- **Frontend**: Atualização da UI do `AIAgent.tsx` para mostrar visualmente quando o agente está "consultando dados" ou "usando uma ferramenta".
- **Security**: Definição de permissões granulares para o que a IA pode acessar.
