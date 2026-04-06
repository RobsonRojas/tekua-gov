## Context

A Associação Tekuá utiliza o sistema de economia de dádiva para manter sua base comunitária. A digitalização desse processo através de um quadro de tarefas e uma moeda virtual ("Surreal") permite escalar a colaboração e tornar o reconhecimento do trabalho transparente e auditável.

## Goals / Non-Goals

**Goals:**
- Criar um quadro de "Oferta e Procura" de tarefas internas da associação.
- Implementar o sistema de pontuação virtual "Surreal".
- Prover mecanismo de prova de trabalho através de mídias georreferenciadas (fotos com coordenadas).
- Permitir que o requisitante valide a entrega antes da transferência dos Surreais.

**Non-Goals:**
- Conversão de Surreais em moedas fiduciárias (Real, Dólar).
- Sistema complexo de arbitragem de conflitos (será resolvido via canais de governança).

## Decisions

- **Currency name**: Surreal.
- **Georeferencing**: Utilizar a API de Geolocation do navegador para capturar `lat/lng` no momento do upload da foto de prova.
- **Table Schema**:
    - `tasks`: Cabeçalho da tarefa, coordenadas de destino e valor.
    - `task_evidence`: Registros das submissões dos membros com URLs do storage.
    - `wallets`: Tabela de saldo simples por `profile_id`.
- **Validation**: O membro que cadastrou a tarefa deve dar o "OK" final após revisar as fotos para que o saldo seja transferido.

## Risks / Trade-offs

- **Privacy**: Fotos georreferenciadas podem expor localizações privadas de membros. O sistema deve informar claramente sobre a coleta de coordenadas.
- **Fraud**: Membros podem tentar burlar geolocalização com ferramentas de software. A revisão humana (pelo requisitante) é o principal filtro contra fraude.
