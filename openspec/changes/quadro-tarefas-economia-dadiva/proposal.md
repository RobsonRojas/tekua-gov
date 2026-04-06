## Why

A Associação Tekuá fundamenta sua sustentabilidade social na colaboração mútua. A implementação de uma economia de dádiva digital, baseada na moeda virtual "Surreal", incentiva membros a contribuírem com as necessidades da comunidade. Ao atrelar recompensas virtuais a tarefas reais com provas de execução, criamos um sistema de reconhecimento de valor e engajamento prático.

## What Changes

Implementar o Quadro de Tarefas e Sistema Surreal:
1.  Criação da página `/tasks-board` para visualização de tarefas disponíveis.
2.  Interface para "Cadastrar Tarefa" onde o requisitante define a descrição, geolocalização e valor em Surreais.
3.  Funcionalidade de "Realizar Tarefa" (Check-in).
4.  Módulo de Provas de Trabalho: Upload de fotos georreferenciadas no momento da conclusão da tarefa.
5.  Sistema de saldo virtual (Wallet) no perfil do usuário para exibir seus "Surreais" acumulados.
6.  Integração com o Supabase para gerenciar a tabela de tarefas e logs de transações.

## Capabilities

### New Capabilities
- `gift-economy-tasks`: Quadro colaborativo de tarefas com sistema de recompensa em moeda virtual e verificação por evidências georreferenciadas.

### Modified Capabilities
- None

## Impact

- `src/pages/TasksBoard.tsx`: Interface principal do quadro.
- `src/pages/Wallet.tsx`: Exibição de saldo e histórico de ganhos.
- `supabase/migrations`: Tabelas de `tasks`, `task_submissions` e `user_wallets`.
- `PWA Capability`: Uso da API de geolocalização do navegador para anexar coordenadas às fotos.
- `translation.json`: Termos relacionados à moeda surreal e fluxo de tarefas.
