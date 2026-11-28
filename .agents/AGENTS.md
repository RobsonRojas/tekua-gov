# Regras Específicas do Workspace (Tekuá)

- **Validação de Build Obrigatória:** Em todas as OpenSpec changes (ao usar fluxos como `/opsx-propose` ou `/opsx-apply`), você deve incluir e executar a validação de build (por exemplo, rodando `npm run build`, `npm run typecheck`, etc.) como parte do checklist de implementação. Nunca finalize uma mudança de código e OpenSpec sem garantir que o build do projeto passou com sucesso.
