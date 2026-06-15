## Context

O projeto Tekuá possui um Assistente de Inteligência Artificial para guiar os usuários em suas tarefas comunitárias. Atualmente o menu exibe "AI Assistant" (inglês) e "Assistente de IA" (português). O time decidiu renomeá-lo para "Oracle" (Oráculo) para adotar um tom mais criativo e nativo da plataforma.

## Goals / Non-Goals

**Goals:**
- Renomear strings no UI que referenciam o assistente para "Oracle" e "Oráculo".
- Atualizar arquivos de tradução i18n (`translation.json`).
- Atualizar referências de rotas que exibem o nome do menu (se necessário, sem mudar a URL para não quebrar integrações, apenas o rótulo visual).

**Non-Goals:**
- Mudar o path das URLs (`/ai-assistant` continuará igual para manter integridade das rotas).
- Mudar nomes das Edge Functions ou componentes React (foco apenas no texto exibido).

## Decisions

- **Arquivos de Tradução**: Buscar e substituir as chaves nos arquivos `src/locales/pt/translation.json` e `src/locales/en/translation.json` referentes ao menu.
- **Componentes de Layout**: Verificar se componentes como `Sidebar.tsx`, `BottomNav.tsx` ou `Layout.tsx` possuem textos hardcoded e substituí-los. Caso utilizem as chaves i18n, a substituição nos arquivos JSON será suficiente.

## Risks / Trade-offs

- **[Risco] Inconsistência de Traduções** → Esquecer de alterar o título da página da IA internamente (no header da página de chat).
  - **Mitigação**: Pesquisar por "Assistente de IA" ou "AI Assistant" em todo o diretório `src/` e garantir que o título interno do componente `AIAssistant.tsx` também reflita a mudança.
