## 1. Configuração de Buckets e Segurança

- [ ] 1.1 Revisar e configurar restrições de MIME type no Supabase Storage para os buckets `official-docs` e `task-evidence`.
- [ ] 1.2 Implementar limites de tamanho de arquivo via políticas SQL ou configuração do bucket.
- [ ] 1.3 Refinar RLS do bucket `official-docs` para garantir que apenas membros com nível de acesso específico possam visualizar certos documentos (se aplicável).

## 2. Otimização de Imagens no Frontend

- [ ] 2.1 Integrar biblioteca de compressão de imagens (ex: `browser-image-compression`) no fluxo de upload de evidências.
- [ ] 2.2 Garantir que todas as fotos de tarefas sejam redimensionadas para um máximo de 1920px antes do upload.
- [ ] 2.3 Implementar placeholder/preview de baixa qualidade durante o carregamento de evidências pesadas.

## 3. Gestão e Ciclo de Vida

- [ ] 3.1 Desenvolver script ou lógica de limpeza para arquivos órfãos (registros no DB que foram deletados mas o arquivo permanece no storage).
- [ ] 3.2 Adicionar metadados estruturados aos objetos do storage para facilitar auditorias de uso.

## 4. Testes e Validação

- [ ] 4.1 Tentar fazer upload de arquivos não permitidos (.exe, .zip) e verificar bloqueio.
- [ ] 4.2 Tentar fazer upload de arquivo maior que o limite configurado.
- [ ] 4.3 Validar se a compressão de imagem no frontend está reduzindo o tamanho do arquivo significativamente sem perda crítica de qualidade.
