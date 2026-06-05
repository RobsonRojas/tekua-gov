## Context

Atualmente, erros gerados durante o upload ou exclusão de documentos no Supabase Storage e na API de documentos são passados diretamente para o estado `error` do hook `useDocuments` e exibidos na tela em um componente `<Alert>`. Isso faz com que mensagens internas de banco de dados/Storage em inglês e com termos técnicos do sistema (ex: "The object exceeded the maximum allowed size" ou violações de RLS/banco de dados) apareçam para o usuário final, prejudicando a experiência de uso e expondo detalhes de implementação/segurança.

## Goals / Non-Goals

**Goals:**
- Traduzir as mensagens de erro de upload/deleção para o idioma ativo (PT/EN) usando `useTranslation`.
- Ocultar detalhes internos e mensagens técnicas cruas do Supabase/PostgreSQL.
- Garantir mensagens compreensíveis para limites de tamanho de arquivo, permissão negada (RLS) e arquivos duplicados.

**Non-Goals:**
- Alterar as regras de validação física de RLS do banco de dados ou do bucket.
- Mudar a lógica de exibição visual do componente `DocumentManager` (apenas as strings de erro serão alteradas).

## Decisions

### 1. Utilizar `useTranslation` no Hook `useDocuments`
Em vez de mapear erros diretamente no componente, faremos o mapeamento de erro de baixo nível no hook `useDocuments`. Isso mantém a lógica de tratamento de erros encapsulada no hook e facilita o reuso das mensagens traduzidas.

- **Alternativa Considerada:** Tratar os erros individualmente em cada componente. 
  - *Raciocínio:* O hook é o ponto de entrada das APIs e centraliza o estado `error`, de forma que interceptar os erros nele evita a duplicação de lógica no `DocumentManager.tsx` e em outros locais.

### 2. Mapeamento de Padrões de Mensagens de Erro Cruas
Mapearemos mensagens comuns através de buscas textuais parciais (ex: `exceeded the maximum allowed size` para tamanho de arquivo e `violates row-level security policy` para RLS) e retornaremos chaves do i18n correspondentes:
- `docs.errors.fileTooLarge`: Tamanho do arquivo excede o limite (20MB).
- `docs.errors.permissionDenied`: Usuário sem permissões administrativas suficientes.
- `docs.errors.alreadyExists`: Arquivo com o mesmo caminho/nome já cadastrado.
- `docs.errors.uploadFailed`: Mensagem de erro genérica para falha de upload.
- `docs.errors.deleteFailed`: Mensagem de erro genérica para falha de exclusão.

## Risks / Trade-offs

- **[Risco]** Supabase alterar o formato padrão das mensagens de erro.
  - *Mitigação:* Usaremos buscas flexíveis por substrings em vez de correspondência exata, e usaremos uma mensagem de erro genérica traduzida amigável como fallback para garantir que mensagens internas nunca vazem, mesmo se a mensagem do Supabase mudar.
