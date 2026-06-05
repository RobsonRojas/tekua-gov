## Why

Quando ocorrem falhas no gerenciamento de documentos (por exemplo, RLS violado ou limite de tamanho de arquivo excedido), o sistema exibe mensagens de erro brutas em inglês (ex: "The object exceeded the maximum allowed size" ou "new row violates row-level security policy"). Erros internos devem ser ocultados para maior segurança, e as falhas devem ser apresentadas de forma significativa e traduzida na língua ativa do usuário (PT/EN).

## What Changes

- Tradução de erros comuns do Supabase Storage e da API de documentos (exceder tamanho de arquivo, RLS, arquivo duplicado, etc.) no frontend.
- Ocultar detalhes técnicos internos/mensagens cruas do banco de dados para o usuário final, exibindo em seu lugar uma mensagem padrão amigável (por exemplo, "Você não tem permissão para realizar esta operação").
- Adição de chaves de erro estruturadas nos arquivos de tradução (`translation.json` em PT e EN).

## Capabilities

### Modified Capabilities
- `admin-docs`: Aprimoramento do tratamento e tradução de mensagens de erro no gerenciamento de documentos.

## Impact

- Afeta o hook `useDocuments` (`src/hooks/useDocuments.ts`) para mapear e traduzir erros técnicos.
- Modifica os arquivos de tradução `src/locales/pt/translation.json` e `src/locales/en/translation.json` com novas chaves para erros.
