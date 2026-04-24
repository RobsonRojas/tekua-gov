## Why

A transparência e a segurança são fundamentais na Associação Tekuá. Para que os administradores possam garantir a integridade do sistema, é necessário que eles tenham uma visão centralizada das atividades de todos os membros. Atualmente, o histórico de atividades é visível apenas pelo usuário individual em seu perfil. Implementar uma ferramenta administrativa para visualizar, gerenciar e analisar estas atividades permite:
- Identificar padrões de uso e engajamento da comunidade.
- Auditar ações críticas (como votações e gestão de documentos).
- Investigar comportamentos suspeitos ou erros de autenticação.
- Fornecer suporte aos membros baseado em seu histórico recente de interações.

## What Changes

Implementar a Gestão de Histórico de Atividades no Painel Admin:
1.  **Nova Rota Administrativa**: Criação da página `/admin/activity-log` exclusiva para administradores.
2.  **Interface de Listagem Global**: Tabela avançada exibindo Nome do Usuário, Data/Hora, Tipo de Ação (Login, Votos, Tarefas, etc.) e metadados contextuais.
3.  **Filtros de Busca**: Capacidade de filtrar o histórico por usuário específico, intervalo de datas e categorias de atividade.
4.  **Dashboard de Análise**: Gráficos simples para visualizar tendências de atividade da plataforma (ex: volume de acessos ou participações por dia).
5.  **Políticas de Segurança**: Garantir que as políticas de RLS e rotas de frontend permitam esta visão global apenas para usuários com `role: 'admin'`.

## Capabilities

### New Capabilities
- `admin-activity-management`: Ferramenta centralizada para monitoramento, filtragem e análise de auditoria de todas as interações de usuários no portal.

### Modified Capabilities
- `activity-history`: Estendido para suportar consultas globais por administradores.

## Impact

- `src/pages/AdminActivityHistory.tsx`: Nova página de gestão e análise.
- `src/router.tsx`: Registro da rota protegida.
- `AuthContext.tsx`: Verificação de permissões administrativas para acesso à página.
- `translation.json`: Novos termos de auditoria e labels de filtros administrativos.
- `supabase/functions` (opcional): Função Edge para cálculos agregados de análise se necessário.
