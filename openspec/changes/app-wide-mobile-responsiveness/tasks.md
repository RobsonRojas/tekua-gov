# Tasks: App-Wide Mobile Responsiveness

- [x] 1. Em `src/layouts/MainLayout.tsx`, localizar o `Box component="main"` e garantir que as propriedades CSS contenham `minWidth: 0` e `overflowX: 'hidden'` para impedir que filhos forcem scroll global.
- [x] 2. Em `src/pages/WorkWall.tsx` (e em qualquer outra interface de botões em nível de página), refatorar os contêineres dos Action Buttons para usar `flexDirection: { xs: 'column', sm: 'row' }` no mobile e remover a abordagem dependente de `flexWrap: 'wrap'` e `flex: 1 1 100%`. Os botões internos devem usar estritamente `width: { xs: '100%', sm: 'auto' }`.
