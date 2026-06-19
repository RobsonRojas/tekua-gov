## Context

O formulário de criação de gifts usa chaves i18n que não existem nos arquivos de locale:

| Código | Chave | Problema |
|---|---|---|
| `t('common.title') \|\| 'Título da Dádiva'` | `common.title` | Não existe; `\|\|` não funciona porque `t()` retorna string truthy |
| `t('common.description') \|\| 'Descrição'` | `common.description` | Não existe; mesmo problema |
| `t('common.publish') \|\| 'Publicar'` | `common.publish` | Não existe; mesmo problema |

O namespace `common` possui `cancel`, `send`, `loading`, etc. mas faltam `title`, `description` e `publish`.

## Goals / Non-Goals

**Goals:**
- Adicionar as chaves faltantes nos arquivos de locale
- Remover fallbacks inline (`||`) que não funcionam

**Non-Goals:**
- Não alterar outras partes do formulário
- Não alterar lógica de negócio

## Decisions

### Adicionar chaves ao namespace `common`

As chaves são genéricas e reutilizáveis por outros formulários no futuro, por isso faz sentido adicioná-las ao namespace `common` em vez de criar chaves específicas em `gifts`.

### Remover fallbacks `||`

Após adicionar as chaves, os fallbacks `|| '...'` são desnecessários. Remover para manter o código limpo e consistente com o resto do projeto.

## Risks / Trade-offs

- Nenhum — mudança puramente cosmética nos labels do formulário
