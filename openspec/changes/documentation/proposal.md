## Why

O portal Tekuá deve ser a fonte da verdade para seus membros. Atualmente, o card de Documentação no dashboard não possui um destino funcional. Implementar um hub de documentação permite que os membros consultem regulamentos internos, guias de convivência e registros históricos de forma organizada e rápida.

## What Changes

Implementar o Visualizador de Documentação:
1.  Ativação do botão no card de Documentação no `Home.tsx` para `/documents`.
2.  Criação da página `Documentation.tsx`.
3.  Interface de consulta integrada com a tabela `documents` (campo de metadados para filtrar por Documentos Públicos/Membros).
4.  Funcionalidade de download e visualização prévia (Preview) de PDFs.
5.  Organização por pastas ou categorias visuais (Estatuto, Atas, Manuais).

## Capabilities

### New Capabilities
- `documentation-viewer`: Área de consulta e visualização de documentos institucionais para membros autenticados.

### Modified Capabilities
- None

## Impact

- `src/pages/Home.tsx`: Ativação do link de navegação.
- `src/pages/Documentation.tsx`: Nova página de visualização.
- `src/router.tsx`: Registro da nova rota.
- `translation.json`: Termos de navegação e labels de documentos.
