## Context

O Painel Admin (`AdminPanel.tsx`) centraliza as principais ferramentas de gestão da plataforma. Atualmente, a navegação entre estas ferramentas é feita via abas horizontais que transbordam em telas menores, exigindo rolagem lateral.

## Goals / Non-Goals

**Goals:**
- Implementar um menu suspenso responsivo para o Painel Admin.
- Manter a sincronia com o parâmetro `?tab=` na URL.
- Exibir ícones representativos para cada ferramenta no menu.
- Unificar o estilo visual do seletor mobile com as outras páginas do PWA.

**Non-Goals:**
- Refatorar os sub-componentes (DocumentManager, FinancialIntegrity, etc.).
- Mudar a lógica de permissões administrativas.

## Decisions

- **Breakpoint:** Utilizar `sm` (600px) como limite para alternar entre Tabs e Menu.
- **Estrutura:** Criar um array de objetos para as abas, unificando a lógica que hoje está dividida entre `tabMap` e a renderização dos `Tab` components.
- **Componente:** Utilizar `Button` + `Menu` (MUI) para garantir que a interface pareça um seletor de contexto e não apenas um menu de navegação global.
- **URL Sync:** Continuar utilizando `useSearchParams` para que o botão de "Voltar" do navegador funcione corretamente entre as abas.

## Risks / Trade-offs

- [Descoberta] → Ocultar as abas atrás de um menu pode fazer com que ferramentas menos usadas (ex: Auditoria) sejam esquecidas. *Mitigação:* O rótulo do botão deve ser auto-explicativo ("Ferramenta: Nome").
- [Complexidade] → Sincronizar o estado interno `tabValue` com o menu e com a URL exige cuidado para evitar loops de renderização. *Mitigação:* Manter a lógica de `useEffect` baseada no `searchParams`.
