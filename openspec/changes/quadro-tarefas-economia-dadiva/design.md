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

- **Unified Framework**: Esta funcionalidade segue as especificações do [Framework Unificado de Economia de Dádiva](../user-surreal-digital-currency-wallet/framework-design.md).
- **Activity Configuration**: Tarefas criadas pela associação serão do `type = 'task'` com `validation_method = 'requester_approval'`.
- **i18n**: Todos o conteúdo de títulos e descrições das tarefas deve suportar o formato **JSONB**.
- **Georeferencing**: Utilizar a API de Geolocation do navegador para capturar `lat/lng` se `geo_required == true`.
- **Validation**: O membro que cadastrou a tarefa (`requester_id`) deve dar o "OK" final através da Edge Function `process_activity_validation`.

## Risks / Trade-offs

- **Privacy**: Fotos georreferenciadas podem expor localizações privadas de membros. O sistema deve informar claramente sobre a coleta de coordenadas.
- **Fraud**: Membros podem tentar burlar geolocalização com ferramentas de software. A revisão humana (pelo requisitante) é o principal filtro contra fraude.
