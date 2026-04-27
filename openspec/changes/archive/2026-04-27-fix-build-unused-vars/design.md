## Context

Durante o processo de build do projeto Vite com TypeScript, o compilador `tsc` está configurado para falhar se encontrar variáveis ou importações não utilizadas. Isso garante a limpeza do código, mas impede o deploy se houver resquícios de refatorações anteriores.

Os arquivos afetados são:
- `src/components/LanguageSelector.tsx`
- `src/components/Navigation/Sidebar.tsx`

## Goals / Non-Goals

**Goals:**
- Eliminar todos os erros de "unused variables" reportados pelo `tsc`.
- Garantir que `npm run build` seja concluído com sucesso.

**Non-Goals:**
- Alterar a funcionalidade dos componentes.
- Re-introduzir bibliotecas de gerenciamento de título que foram evitadas (mantendo a implementação leve via `useEffect`).

## Decisions

### 1. Remoção Cirúrgica de Importações
Removeremos as importações não utilizadas de bibliotecas como `@mui/material` (`Box`) e `lucide-react` (`Languages`).

### 2. Ajuste na Desestruturação do useTranslation
No `Sidebar.tsx`, a variável `i18n` retornada pelo hook `useTranslation` não está sendo utilizada. Alteraremos a desestruturação para `const { t } = useTranslation();`.

## Risks / Trade-offs

- **[Risco]** Remoção acidental de algo necessário.
  - **Mitigação**: O TypeScript reportará erro se algo necessário for removido. O build validará o estado final.
