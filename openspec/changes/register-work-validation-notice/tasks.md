## 1. Texto do aviso

- [x] 1.1 Adicionar `work.registerValidationNotice` em `src/locales/pt/translation.json` ("Ao enviar, seu trabalho vai direto para a coluna \"Para Validar\" do Mural, onde os validadores o confirmam. Ele não passa pelas colunas Aberta e Em Execução.")
- [x] 1.2 Adicionar `work.registerValidationNotice` em `src/locales/en/translation.json` com o texto equivalente, usando o nome da coluna exibido no Mural em inglês

## 2. Formulário

- [x] 2.1 Em `src/pages/RegisterWork.tsx`, exibir um `Alert severity="info"` com `t('work.registerValidationNotice', <texto pt>)` acima dos botões de envio e cancelar

## 3. Validação

- [x] 3.1 Escrever teste em `RegisterWork.test.tsx` verificando que o aviso aparece ao abrir o formulário
- [x] 3.2 Verificar que os dois JSON continuam válidos e executar `npm run build` sem erros
