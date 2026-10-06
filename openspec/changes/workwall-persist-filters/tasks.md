## 1. Work Wall - Persistência e Indicador de Filtros

- [x] 1.1 Em `src/pages/WorkWall.tsx`, inicializar o estado `filters` lendo de `localStorage` (chave `tekua:workwall:filters`, texto JSON), mesclando com os defaults e ignorando valores inválidos.
- [x] 1.2 Em `src/pages/WorkWall.tsx`, sincronizar mudanças de `filters` para o `localStorage`.
- [x] 1.3 Exibir um indicador visual quando há filtros ativos (diferente do default) — ex.: badge com a quantidade de filtros ativos no botão/área de filtros.

## 2. Validação

- [x] 2.1 Executar `npm run build` para garantir que o build não quebre.
- [x] 2.2 Verificar manualmente que os filtros persistem após reload e que o indicador aparece/some corretamente.
