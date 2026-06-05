## Context

Atualmente, todos os documentos (físicos e links externos) são encaminhados para o modal de visualização segura `DocumentViewerModal`. Links externos falham ao carregar em frames por restrições de CORS/X-Frame-Options e exibem um erro de formato não suportado. Esta mudança visa abrir documentos que sejam links externos diretamente em uma nova aba do navegador.

## Goals / Non-Goals

**Goals:**
- Alterar o comportamento de visualização no `DocumentList` para que links externos (documentos com `external_url`) abram em nova aba do navegador (`_blank`) de forma segura.
- Garantir que apenas arquivos físicos (documentos com `file_path`) continuem abrindo no modal de visualização integrada.

**Non-Goals:**
- Alterar a lógica interna do `DocumentViewerModal` para lidar com links.
- Remover restrições de segurança ou downloads de arquivos locais.

## Decisions

### Decisão 1: Interceptação de links no handler de visualização do `DocumentList`
- **Abordagem**: Modificar a função `handleView` em `src/components/admin/DocumentList.tsx` para que, ao detectar a presença de `doc.external_url`, execute `window.open` em vez de setar o estado do visualizador modal.
- **Raciocínio**: Como o `DocumentList` é o componente central para exibição tanto no painel de administração quanto na área de membros, centralizar essa decisão no `handleView` resolve o problema de maneira limpa para ambos os fluxos, sem afetar o modal de visualização segura.
- **Segurança**: Abertura em nova aba utilizará os atributos de segurança `noopener,noreferrer`.

### Decisão 2: Atualização dos Testes
- **Abordagem**: Atualizar e adicionar cenários nos testes unitários e de integração (E2E) para garantir a cobertura desse novo comportamento.
- **Raciocínio**: Precisamos de testes que comprovem que links externos abrem em nova aba e que arquivos físicos ainda abrem usando a visualização integrada.

## Risks / Trade-offs

- **[Risco] Bloqueador de Pop-ups** → O uso de `window.open` acionado diretamente por um clique do usuário (evento síncrono no clique do botão "Visualizar") é geralmente permitido pela maioria dos navegadores, mitigando o risco de bloqueio de pop-ups.
