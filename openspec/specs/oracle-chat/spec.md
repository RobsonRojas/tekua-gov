# oracle-chat Specification

## Purpose

Define o comportamento do chat do Oráculo (assistente de IA): apresentação localizada das sugestões de interação e ancoragem das respostas na definição correta da plataforma e nos documentos oficiais.

## Requirements

### Requirement: Sugestões de Interação Localizadas
O sistema SHALL apresentar as sugestões iniciais de interação do Oráculo traduzidas a partir do dicionário de i18n, sem exibir as chaves de tradução cruas. As chaves `ai.suggest.whatIsTekua`, `ai.suggest.howToEarn` e `ai.suggest.votingRules` SHALL existir nos dicionários em português e inglês.

#### Scenario: Exibição das sugestões no idioma ativo
- **WHEN** o usuário abre a página do Oráculo
- **THEN** as sugestões de mensagem SHALL ser exibidas com o texto traduzido obtido do dicionário de i18n, e SHALL NOT exibir as chaves brutas (ex: `ai.suggest.whatIsTekua`)

### Requirement: Contexto da Plataforma e Ancoragem em Documentos Oficiais
O sistema SHALL instruir o Oráculo de que atua como assistente de governança comunitária, gestão de demandas, economia circular descentralizada e justiça restaurativa projetada para aldeias e comunidades, sem restringir seu escopo a "extrativistas da Amazônia". O Oráculo SHALL basear estritamente suas respostas nos documentos oficiais fornecidos no contexto do Gerenciador de Documentos Oficiais e SHALL informar quando a informação não constar neles.

#### Scenario: Definição da plataforma
- **WHEN** o usuário pergunta ao Oráculo o que é a Tekuá
- **THEN** o Oráculo SHALL responder descrevendo a plataforma de governança comunitária, gestão de demandas, economia circular descentralizada e justiça restaurativa, sem mencionar um escopo restrito à Amazônia

#### Scenario: Resposta ancorada em documentos oficiais
- **WHEN** o usuário faz uma pergunta cuja resposta não está contida nos documentos oficiais fornecidos no contexto
- **THEN** o Oráculo SHALL informar que não possui essa informação nos documentos oficiais, em vez de responder a partir de conhecimento externo ou suposição
