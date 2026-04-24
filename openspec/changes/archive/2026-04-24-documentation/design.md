## Context

A Associação Tekuá utiliza documentos oficiais para formalizar decisões e regras. Atualmente, os membros não têm um local dentro do portal para consultar o estatuto ou atas de assembleia, recorrendo a canais externos (Whatsapp, Email). Centralizar a documentação aumenta a transparência e facilita a integração de novos membros.

## Goals / Non-Goals

**Goals:**
- Implementar a página de visualização de documentação institucional.
- Prover filtros por categoria (Estatutos, Atas, Manuais, Financeiro).
- Permitir a visualização de documentos PDF diretamente ou download.

**Non-Goals:**
- Funcionalidade de upload (já tratada na proposta `admin-panel-documents-manager`).
- OCR ou busca textual dentro dos arquivos PDF.

## Decisions

- **Data Source**: Utilizar a tabela `documents` (criada na proposta de Admin) para listar os metadados dos arquivos.
- **Access Logic**: Documentos com metadado `visibility: 'member'` ou `visibility: 'public'` serão exibidos nesta área.
- **UI Architecture**: Listagem em Grid ou Lista com ícones representando o tipo de arquivo.
- **Preview System**: Utilizar `window.open` para URLs assinadas (signed URLs) do Supabase Storage para visualização nativa no navegador.

## Risks / Trade-offs

- **Storage URL Expiration**: URLs assinadas expiram após um tempo (ex: 60 min). É necessário gerar a URL no momento do clique.
- **Accessibility**: Garantir que a listagem de documentos seja navegável por teclado e amigável a leitores de tela.
