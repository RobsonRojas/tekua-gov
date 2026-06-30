## Why

A ecovila Tekuá possui um protocolo consolidado de Justiça Restaurativa ("Protocolo de Justiça Restaurativa da Tekuá – Manual para Resolução de Conflitos no Núcleo Morretes") focado na mediação de conflitos e reparação do tecido relacional e ambiental. Para facilitar o acesso, compreensão e aplicação deste protocolo pelos membros da comunidade, especialmente em momentos de tensão onde a clareza pode ser afetada, é necessário implementar um módulo digital interativo que guie os usuários através dos passos e princípios do manual.

## What Changes

- Criação de um novo módulo "Justiça Restaurativa".
- Adição de um **Agente de IA** instruído com o Protocolo de Justiça Restaurativa da Tekuá, capaz de atuar como facilitador inicial, oferecendo escuta empática e orientando os usuários pelos passos adequados do protocolo.
- Adição de um **Assistente Guiado (Wizard)**, que através de um fluxo de perguntas e respostas baseado no protocolo, ajuda o usuário a refletir sobre o conflito e recomenda a ação a ser tomada (ex: auto-reflexão, diálogo direto com CNV, mediação individual, ou convocação de Câmara).

## Capabilities

### New Capabilities
- `justica-restaurativa-agente`: Agente de IA de justiça restaurativa que orienta o usuário de forma interativa e conversacional usando o protocolo do Núcleo Morretes.
- `justica-restaurativa-wizard`: Wizard (fluxo passo a passo) que a partir de perguntas respondidas pelo usuário (baseadas no protocolo), apresenta a orientação estruturada sobre como proceder no conflito.

### Modified Capabilities
- N/A

## Impact

- **UI/UX**: Novas telas e componentes para interação conversacional com o agente de IA e para o fluxo de wizard. Navegação adicional no menu principal para o módulo de Justiça Restaurativa.
- **Backend**: Integração com modelos de IA Generativa para processamento da linguagem natural no agente interativo, utilizando prompt engneering com os dados do manual.
- **Database**: Possível registro de sessões de wizard/agente (sempre respeitando os princípios de confidencialidade citados no protocolo, ou garantindo o anonimato).
