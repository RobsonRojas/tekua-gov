## ADDED Requirements

### Requirement: Lista de requisitos para confirmar tarefa
Quando o botão de confirmar tarefa ou demanda estiver visível porém desabilitado, o sistema MUST exibir junto a ele uma lista de requisitos de confirmação, indicando para cada um se está satisfeito ou não. A lista MUST conter ao menos um requisito não satisfeito (a causa do bloqueio). Os textos MUST usar linguagem simples, descrever o que o usuário precisa fazer ou entender, e não expor termos técnicos (nomes de campos, métodos internos, códigos). A lista MUST NOT ser exibida quando o botão estiver habilitado.

#### Scenario: Executor não pode confirmar o próprio trabalho
- **WHEN** um usuário que é executor da tarefa, sem ser o solicitante nem administrador, abre a tarefa em validação
- **THEN** o botão de confirmar está desabilitado
- **AND** a lista mostra como não satisfeito um requisito com texto como "Outra pessoa que não executou a tarefa precisa confirmar"

#### Scenario: Usuário já confirmou
- **WHEN** um usuário que já confirmou a tarefa a abre novamente
- **THEN** o botão está desabilitado
- **AND** a lista mostra como não satisfeito o requisito "Você ainda não confirmou esta tarefa"

#### Scenario: Requisitos satisfeitos aparecem junto aos pendentes
- **WHEN** a lista é exibida e alguns requisitos estão satisfeitos
- **THEN** cada requisito satisfeito aparece com indicação visual de concluído, distinta dos pendentes

#### Scenario: Botão habilitado
- **WHEN** o usuário pode confirmar a tarefa
- **THEN** o botão está habilitado e a lista de requisitos não é exibida

#### Scenario: Idioma
- **WHEN** o usuário usa o idioma inglês ou português
- **THEN** os textos da lista aparecem no idioma selecionado
