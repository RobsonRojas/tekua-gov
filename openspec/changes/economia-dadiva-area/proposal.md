## Why

A plataforma precisa de um espaço dedicado para incentivar o compartilhamento e a generosidade entre os membros. A criação de uma área de "Dádiva" onde usuários podem ofertar bens, habilidades ou recursos para a comunidade fomenta uma economia circular. Além disso, a introdução de "Pontos de Dádiva" recompensará e reconhecerá os usuários que mais contribuem de forma altruísta, engajando ainda mais a rede.

## What Changes

- **Área de Dádivas**: Criação de uma nova página/dashboard onde os membros podem visualizar, buscar e cadastrar dádivas (ofertas).
- **Cadastro de Dádivas**: Formulário para o usuário listar o que está oferecendo (descrição, categoria, disponibilidade).
- **Sistema de Pontuação (Pontos de Dádiva)**: Quando outro membro "utiliza" ou aceita uma dádiva, o usuário que a cadastrou recebe "Pontos de Dádiva".
- **Tracking de Uso**: Mecanismo para registrar o uso/consumo de uma dádiva, acionando a recompensa em pontos.

## Capabilities

### New Capabilities
- `gift-economy-area`: Gerenciamento centralizado de dádivas (criação, listagem e detalhamento de ofertas comunitárias).
- `gift-points-system`: Sistema de recompensa que contabiliza "Pontos de Dádiva" para usuários baseados no uso de suas dádivas cadastradas.

### Modified Capabilities
- `navigation-interface`: Adição de links/ícones no menu lateral para acessar a nova área de Dádivas.

## Impact

- **Banco de Dados**: Novas tabelas `gifts` (dádivas) e `gift_usage` (registro de uso). Possível extensão na tabela de carteira ou nova tabela para `gift_points`.
- **APIs**: Novas Edge Functions para gerenciar o ciclo de vida das dádivas e registrar transações de pontos.
- **Frontend**: Novas rotas e páginas (`/gifts`), e atualização do menu de navegação.
