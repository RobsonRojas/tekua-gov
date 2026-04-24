## Why

O card de "Governança" no dashboard principal é o acesso principal para as atividades core da plataforma (Votações, Estatutos, Propostas). Atualmente, o botão "Acessar" deste card não redireciona o usuário para nenhuma tela funcional. É necessário implementar este hub para centralizar os serviços de tomada de decisão e consulta institucional.

## What Changes

Implementar o Hub de Serviços de Governança:
1.  Ativação do botão de acesso no card de Governança no `Home.tsx`.
2.  Criação da tela `GovernanceServices.tsx` para listar as funcionalidades disponíveis.
3.  Implementação de cartões de acesso para:
    - Sistema de Votação (direciona para `/voting`).
    - Documentação Oficial (direciona para `/documents`).
    - Histórico de Decisões.
4.  Configuração das rotas correspondentes no `router.tsx`.

## Capabilities

### New Capabilities
- `governance-services`: Hub centralizado para acesso aos serviços institucionais e de tomada de decisão da Associação Tekuá.

### Modified Capabilities
- None

## Impact

- `src/pages/Home.tsx`: Ativação do link de navegação.
- `src/pages/GovernanceServices.tsx`: Nova página de hub.
- `src/router.tsx`: Registro da nova rota pública (autenticada).
- `translation.json`: Termos relacionados à governança.
