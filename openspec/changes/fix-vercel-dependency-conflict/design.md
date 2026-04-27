## Context

O projeto Tekua Gov foi atualizado para o React 19, porém utiliza o pacote `react-quill@2.0.0`, que possui uma `peerDependency` restrita ao React 16, 17 ou 18. Ao realizar o deploy no Vercel, o comando `npm install` falha com erro `ERESOLVE` devido a esta inconsistência.

## Goals / Non-Goals

**Goals:**
- Resolver o bloqueio do deploy no Vercel causado pelo conflito de dependências.
- Manter o uso do React 19 e do `react-quill` sem modificações no código fonte.
- Garantir que a solução seja versionada e aplicada automaticamente em todos os ambientes.

**Non-Goals:**
- Fazer downgrade do React para a versão 18.
- Substituir o `react-quill` por outro editor de texto rico nesta mudança.
- Alterar configurações manuais no painel do Vercel (preferindo configuração via código).

## Decisions

### 1. Uso de `.npmrc` com `legacy-peer-deps=true`
Decidimos criar um arquivo `.npmrc` na raiz do projeto contendo a instrução `legacy-peer-deps=true`.

- **Rationale**: Esta configuração instrui o npm a ignorar conflitos estritos de `peerDependencies` e utilizar uma estratégia de resolução similar às versões anteriores do npm (v6). Como o projeto já funciona localmente com React 19 e `react-quill` (provavelmente devido ao uso de `--force` ou instaladores que não barram o conflito), esta mudança apenas formaliza o comportamento no ambiente de CI/CD.
- **Alternatives**: 
    - Alterar o "Install Command" no Vercel para `npm install --legacy-peer-deps`. **Rejeitado**: Menos portável e difícil de manter em múltiplos ambientes.
    - Usar `overrides` no `package.json`. **Considerado**: Uma alternativa válida, mas o `.npmrc` é mais abrangente caso surjam outros conflitos similares com o ecossistema React 19.

## Risks / Trade-offs

- **[Risk]** Instalação de dependências genuinamente incompatíveis. → **Mitigation**: A validação final depende do build de produção (`npm run build`) e dos testes unitários/E2E que já fazem parte do pipeline. Se houver incompatibilidade real de API, o build ou os testes falharão.
- **[Trade-off]** Abordagem menos "limpa" que resolver cada dependência individualmente. → **Rationale**: Necessário para manter a agilidade do deploy enquanto o ecossistema de bibliotecas React se adapta à versão 19.
