## MODIFIED Requirements

### Requirement: Suporte Inteligente ao Membro
O sistema SHALL oferecer um assistente de IA capaz de sanar dúvidas sobre o ecossistema Tekuá de forma automatizada, interativa e precisa. O sistema SHALL citar de forma explícita as fontes oficiais e regulamentos (usando os documentos no contexto) nas respostas. A interface do sistema SHALL prover facilitadores de UX, como prompts sugeridos ("chips"), controles para interromper o fluxo de resposta (Stop Generation) e mecanismos de feedback do usuário para evolução da IA.

#### Scenario: Citação Transparente de Fontes
- **WHEN** o agente responde a uma dúvida baseada em um trecho do Estatuto fornecido pelo contexto.
- **THEN** o agente finaliza a resposta com um texto similar a: "(Fonte: Estatuto da Associação Tekuá - Capítulo X)".

#### Scenario: Abortar Resposta Longa
- **WHEN** a IA está em processo de geração e streaming de uma resposta e o usuário clica no botão "Parar".
- **THEN** o frontend encerra imediatamente o stream, e a resposta parcial é mantida na tela, pronta para que o usuário faça uma nova pergunta.

#### Scenario: Feedback de Qualidade
- **WHEN** uma mensagem da IA é concluída, exibindo ícones de aprovação e reprovação (👍 / 👎).
- **THEN** o usuário clica em um deles e o sistema registra esse feedback silenciosamente (em background) vinculado à conversa, sem interromper o fluxo.
