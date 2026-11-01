## 1. Traduções

- [x] 1.1 Adicionar `work.inviteExternal` e a chave da frase de instrução do convite em `src/locales/pt/translation.json` ("Convite Externo" e "Compartilhe este QR Code ou o link abaixo para permitir que pessoas externas se cadastrem na Tekuá e assumam esta tarefa.")
- [x] 1.2 Adicionar as mesmas chaves em `src/locales/en/translation.json` com o texto equivalente

## 2. Detalhe da tarefa

- [x] 2.1 Em `TaskDetail.tsx`, usar `t('work.inviteExternal', 'Convite Externo')` e a nova chave na frase de instrução
- [x] 2.2 Em `TaskDetail.tsx`, conter o bloco do convite: `minWidth: 0` nos itens flex, link com quebra em várias linhas no lugar de reticências, botão "Copiar" sempre visível
- [x] 2.3 Em `TaskDetail.tsx`, aplicar quebra de palavras e URLs longas na descrição, mantendo `pre-wrap`

## 3. Validação

- [x] 3.1 Teste de renderização: o título do convite aparece traduzido e a frase de instrução completa é exibida
- [x] 3.2 Verificar que os dois JSON continuam válidos e executar `npm run build` sem erros
