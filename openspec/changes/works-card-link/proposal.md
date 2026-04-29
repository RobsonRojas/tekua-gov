## Why

Para facilitar a comunicação e o compartilhamento de tarefas entre os usuários, permitindo que eles enviem links diretos para tarefas específicas no mural de trabalho. Isso melhora a usabilidade da plataforma ao permitir a navegação direta para os detalhes de uma tarefa sem a necessidade de busca ou rolagem manual no quadro.

## What Changes

- Adição de um botão ou ícone de "Compartilhar" em cada card de tarefa no mural de trabalho.
- Implementação de funcionalidade para copiar uma URL única da tarefa para a área de transferência ao clicar no botão de compartilhamento.
- Implementação de deep linking/roteamento para que o acesso à URL única abra o mural de trabalho e foque ou abra automaticamente os detalhes da tarefa específica.
- Atualização da UI para lidar com o destaque ou abertura de modal quando um ID de tarefa estiver presente na URL.

## Capabilities

### New Capabilities
- `task-deep-linking`: Lógica para geração e tratamento de URLs únicas de tarefas e destaque na interface do usuário.

### Modified Capabilities
- `gift-economy-tasks`: Adição de requisito para compartilhamento de tarefas e acesso direto via URL.

## Impact

- **Frontend**: Componente de card de tarefa (`WorkCard`), página do mural de trabalho, lógica de roteamento e hooks de URL.
- **Roteamento**: Definição de padrão de URL para tarefas (ex: `/mural?task=ID` ou `/mural/tasks/ID`).
