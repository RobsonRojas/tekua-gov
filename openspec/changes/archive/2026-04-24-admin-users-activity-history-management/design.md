## Context

O sistema Tekuá possui uma política de transparência radical. Embora o histórico de atividades pessoal ajude o membro a monitorar suas próprias interações, a versão administrativa é crucial para que a diretoria e os auditores da associação possam supervisionar a saúde da plataforma, garantir a conformidade institucional e analisar o engajamento coletivo.

## Goals / Non-Goals

**Goals:**
- Implementar a página de Auditoria de Atividade Global (`/admin/activity`).
- Permitir que administradores identifiquem atividades por usuário, tipo ou data.
- Fornecer métricas visuais (dashboards) de participação para análise de tendências.
- Garantir a integridade dos dados e o acesso restrito via RLS.

**Non-Goals:**
- Edição ou remoção de logs de atividades (histórico imutável de auditoria).
- Detalhamento forense de logs de rede IP ou geolocalização (foco em ações de negócio).

## Decisions

- **URL Structure**: Accessible via `/admin/activity`.
- **Primary Schema**: Esta funcionalidade utiliza a tabela `activity_logs` especificada em [user-activity-history](../user-activity-history/design.md).
- **Query Strategy**: Utilizar PostgREST para leitura direta com RLS. Através do campo `user_id`, realizar a expansão do objeto (JOIN implícito) para exibir `profiles(full_name, email)`.
- **Filtering**: Implementar filtros de busca por `user_id`, `action_type` e `date_range` no server-side (filtros de URL).
- **Permissions**: Acesso restrito a perfis `admin` via RLS e verificação de token na Edge Function (se houver lógica de exportação futura).

## Risks / Trade-offs

- **Performance**: Uma tabela de logs global cresce exponencialmente. É crucial usar índices eficientes e paginação para manter a interface administrativa rápida.
- **Privacy Sensitivity**: Embora sejam ações de negócio, o acesso consolidado a todo o histórico de um membro exige responsabilidade administrativa.
