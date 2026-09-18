## Why

Ao tentar enviar uma captura de tela tirada no MacOS (cujo nome de arquivo geralmente contém espaços e caracteres acentuados, como `Captura de Tela 2026-08-28 às 16.26.21.png`), o sistema apresenta um erro "Invalid key". Isso impede que os usuários anexem evidências válidas às demandas e registros de trabalho. O problema ocorre porque o nome do arquivo original está sendo usado diretamente como chave no Supabase Storage sem a devida sanitização de caracteres especiais, gerando falha no upload.

## What Changes

- Sanitização do nome de arquivo (remoção de acentos, substituição de espaços por underscores e remoção de caracteres não alfanuméricos) antes de fazer o upload para o Storage.
- Tratamento de erro aprimorado no caso de falha de upload, para que fique mais claro ao usuário.

## Capabilities

### New Capabilities

### Modified Capabilities

## Impact

- Código de frontend responsável pelo upload de arquivos (`UploadEvidencia`, componentes de submissão de demanda e trabalho).
- A experiência do usuário será mais fluida sem erros técnicos no momento do upload.
