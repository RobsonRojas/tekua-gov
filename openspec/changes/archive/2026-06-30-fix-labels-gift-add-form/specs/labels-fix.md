# Gift Add Form — Labels i18n

## Keys a adicionar em `common`

```json
{
  "title": "Título",
  "description": "Descrição",
  "publish": "Publicar"
}
```

## Código atual (com bug)

```tsx
label={t('common.title') || 'Título da Dádiva'}
label={t('common.description') || 'Descrição'}
{submitting ? <CircularProgress size={24} /> : (t('common.publish') || 'Publicar')}
```

`t()` retorna a própria key quando não encontra (`'common.title'`), que é truthy, então `||` nunca usa o fallback.

## Código após correção

```tsx
label={t('common.title')}
label={t('common.description')}
{submitting ? <CircularProgress size={24} /> : t('common.publish')}
```
