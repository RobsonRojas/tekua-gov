## Why

A associação precisa garantir que os documentos oficiais e registros internos fiquem protegidos contra downloads e cópias não autorizadas. A capacidade atual de abrir links diretos do Supabase Storage em novas abas permite que qualquer membro baixe, imprima ou compartilhe os arquivos facilmente, o que vai contra as diretrizes de privacidade e governança da associação.

## What Changes

- Remoção de qualquer botão ou ação que permita o download direto de arquivos oficiais.
- Implementação de um componente de visualização integrada (Document Viewer Modal) no frontend para visualização de documentos.
- Configuração de restrições de segurança no visualizador, incluindo desativação de barra de ferramentas do leitor de PDF (ex: ocultar botões de download e impressão), desativação de clique com botão direito do mouse (context menu) e seleção de texto/mídia.
- Ajuste das especificações oficiais para explicitar a proibição de downloads.

## Capabilities

### New Capabilities

### Modified Capabilities

- `admin-docs`: Alterado para proibir o download de documentos registrados e forçar o uso da visualização segura.
- `documentation-viewer`: Alterado para exibir os documentos em um visualizador seguro em vez de abrir uma nova aba com URL direta de download.

## Impact

- **Frontend**: Componentes `DocumentList`, `Documentation` e `DocumentManager` serão alterados para não prover links ou botões de download e para usar um componente modal de visualização segura.
- **Testes**: Atualização de testes no Playwright/Vitest que assumem o comportamento anterior de download ou abertura de aba.
