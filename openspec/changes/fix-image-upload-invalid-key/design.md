## Context

Ao anexar arquivos no MacOS e em alguns outros sistemas, o nome do arquivo pode conter acentos e espaços, causando o erro "Invalid key" no Supabase Storage. (Veja `proposal.md` para motivação).

## Goals / Non-Goals

**Goals:**
Garantir o upload bem-sucedido de arquivos com nomes contendo caracteres especiais e espaços, gerando chaves seguras e limpas para o Supabase Storage.

**Non-Goals:**
Mudar o serviço de storage ou a forma de armazenamento das evidências no banco de dados.

## Decisions

- **Sanitização de nome de arquivo**: Utilizaremos a função de string nativa do JavaScript (`normalize('NFD').replace(/[\u0300-\u036f]/g, "")`) para remover acentos, seguida de uma regex para remover outros caracteres especiais e substituir espaços por underscores.
- Isso permite que o nome permaneça legível na URL sem gerar falhas em sistemas de arquivos ou URLs (Invalid key).

## Risks / Trade-offs

- **Extensões de arquivos**: Nomes de arquivo com mais de um ponto (e.g., `meu.arquivo.png`) precisam preservar a extensão final; a lógica de sanitização garantirá que o último segmento permaneça intacto.
