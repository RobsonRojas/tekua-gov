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

- **URL Structure**: `/admin/activity`.
- **Query Strategy**: Utilizar um `JOIN` (via PostgREST do Supabase) entre a tabela `activity_logs` e a tabela `profiles` para obter o nome e email do executor de cada ação.
- **Filtering**: Implementar filtros de busca no lado do servidor para evitar carregamento excessivo de dados no client-side.
- **Audit Persistence**: A tabela `activity_logs` (especificada na proposta do usuário) será a fonte única da verdade.
- **Permissioning**: Verificação obrigatória do campo `role: 'admin'` no objeto de perfil do usuário logado.

## Risks / Trade-offs

- **Performance**: Uma tabela de logs global cresce exponencialmente. É crucial usar índices eficientes e paginação para manter a interface administrativa rápida.
- **Privacy Sensitivity**: Embora sejam ações de negócio, o acesso consolidado a todo o histórico de um membro exige responsabilidade administrativa.
