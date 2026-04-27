# Walkthrough - Browser Tag Name Fix

O título da aplicação exibido na aba do navegador foi corrigido para refletir a marca correta e agora suporta internacionalização dinâmica.

## Mudanças

### 1. Localização
- Adicionada a chave `app.title` nos arquivos de tradução:
  - Português: "Tekuá Governança"
  - Inglês: "Tekuá Governance"

### 2. Configuração Estática
- O arquivo `index.html` foi atualizado para exibir "Tekuá Governança" como título padrão durante o carregamento inicial, eliminando a referência incorreta anterior.

### 3. Sincronização Dinâmica
- Implementado um `useEffect` no componente raiz (`App.tsx`) que monitora mudanças de idioma via `i18next`.
- O `document.title` é atualizado automaticamente sempre que o usuário altera o idioma no seletor da interface.

## Resultados da Verificação
- Validado via subagente de navegação que:
  - O título inicial é "Tekuá Governança".
  - Ao mudar para Inglês, o título da aba muda para "Tekuá Governance".
  - A troca é instantânea e não exige recarregamento da página.
