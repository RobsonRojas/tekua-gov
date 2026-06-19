## Context

Atualmente, o sistema permite que membros acessem documentos oficiais clicando em "Visualizar", o que gera uma URL assinada do Supabase Storage e a abre em uma nova aba do navegador. Esse comportamento expõe a URL original e permite que o leitor de PDF do navegador ou a aba de imagens forneça opções nativas de download, salvamento e impressão, violando a regra de que os documentos não devem ser baixados.

## Goals / Non-Goals

**Goals:**
- Impedir que usuários visualizem a URL direta do Supabase Storage dos documentos oficiais.
- Proibir downloads diretos eliminando ações e botões de download.
- Exibir PDFs e Imagens dentro de um componente modal controlado no próprio portal (`DocumentViewerModal`).
- Ocultar a barra de ferramentas do leitor de PDF nativo (`#toolbar=0`).
- Bloquear o menu de contexto (clique com botão direito) e o arrastar/soltar nas imagens e na área de visualização.
- Impedir atalhos comuns de teclado para impressão e salvamento (`Ctrl+S`, `Cmd+S`, `Ctrl+P`, `Cmd+P`) dentro do escopo do modal.
- Restringir o upload no painel administrativo apenas para arquivos PDF e Imagens.

**Non-Goals:**
- Bloquear totalmente usuários avançados com conhecimento técnico que monitoram as requisições de rede (DevTools) para extrair binários.
- Evitar capturas de tela (screenshots) ou fotos tiradas com aparelhos externos.

## Decisions

### Decisão 1: Restrição de Tipos de Arquivos no Upload
- **Descrição**: O formulário de upload de documentos oficiais passará a aceitar estritamente arquivos com extensão `.pdf` e tipos de imagem comuns (`image/*`).
- **Alternativas consideradas**: Permitir qualquer arquivo (como `.xlsx` ou `.docx`) e tentar renderizá-los. Rejeitado pois a exibição de planilhas e documentos Word no navegador sem plugins de terceiros ou serviços externos força o download do arquivo, violando a regra central.
- **Racional**: PDFs e Imagens são suportados nativamente para visualização inline em todos os navegadores modernos, viabilizando o controle de exibição segura sem download.

### Decisão 2: DocumentViewerModal
- **Descrição**: Um novo modal React no frontend para exibição inline.
- **Estrutura**:
  - Se for imagem: tag `<img>` com `pointer-events: none`, `user-select: none` e propriedade `onContextMenu={(e) => e.preventDefault()}`.
  - Se for PDF: tag `<iframe>` com `src={signedUrl + '#toolbar=0&navpanes=0&scrollbar=1'}`.
  - Interceptação de teclas no nível do modal (`keydown`) para bloquear `Ctrl+S`, `Cmd+S`, `Ctrl+P`, `Cmd+P`.

## Risks / Trade-offs

- **[Risco]** Usuários podem arrastar a imagem ou tentar salvá-la em dispositivos móveis (toque longo).
  - *Mitigação*: Aplicação de CSS `pointer-events: none` e `user-select: none` na imagem, além do bloqueio de `contextmenu` e `dragstart`.
- **[Risco]** Limitações do iframe de PDF em alguns navegadores móveis (onde o PDF pode ainda tentar baixar ou abrir no app nativo).
  - *Mitigação*: Utilizar CSS e tags de iframe padrão. Se o navegador móvel não suportar visualização inline e tentar forçar o download, exibiremos um aviso amigável informando que a política de segurança impede o download e sugerindo o acesso por desktop.
