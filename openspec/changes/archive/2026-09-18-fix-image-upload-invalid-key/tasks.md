## 1. Correção de Sanitização de Nome de Arquivo

- [x] 1.1 Atualizar `src/components/common/FileUploader.tsx` para sanitizar `uploadingFile.file.name` removendo acentos (usando `normalize('NFD').replace(/[\u0300-\u036f]/g, '')`) e caracteres especiais que quebram a URL do Supabase Storage.
- [x] 1.2 Atualizar `src/pages/RegisterWork.tsx` aplicando a mesma lógica de sanitização de nome de arquivo.
- [x] 1.3 Testar (manualmente/localmente) a sanitização criando nomes de arquivos simulados com acentuação e verificando o formato final gerado antes do upload.
