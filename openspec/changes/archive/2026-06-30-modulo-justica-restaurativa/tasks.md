## 1. Configuração e Roteamento

- [x] 1.1 Criar estrutura de pastas do módulo em `src/pages/JusticaRestaurativa` e `src/components/JusticaRestaurativa`
- [x] 1.2 Adicionar rotas para `/justica-restaurativa`, `/justica-restaurativa/agente` e `/justica-restaurativa/wizard`
- [x] 1.3 Adicionar link para o módulo no menu principal de navegação do Tekuá Gov

## 2. Implementação do Agente de IA

- [x] 2.1 Criar a Edge Function no Supabase para a IA, injetando o prompt focado no Protocolo de Justiça Restaurativa (Passos 1-4 e CNV)
- [x] 2.2 Desenvolver o componente `AgenteChat` com interface conversacional (lista de mensagens e input de texto)
- [x] 2.3 Integrar o componente `AgenteChat` com a Edge Function, garantindo tratamento de erros e exibição de "carregando"
- [x] 2.4 Testar fluxos conversacionais para garantir que a IA incentiva o "Jogo do Espelhamento" e a estrutura "OSNP"

## 3. Implementação do Wizard

- [x] 3.1 Criar o componente central `WizardFlow` para gerenciar o estado da etapa atual na árvore de decisão
- [x] 3.2 Implementar a tela do Passo 1 (Auto-reflexão) com triagem (Sim/Não) para avaliar se o usuário já refletiu sobre o problema
- [x] 3.3 Implementar a tela do Passo 2 (Diálogo Direto), fornecendo campos para ajudar o usuário a formatar sua queixa via OSNP
- [x] 3.4 Implementar a tela de recomendação do Passo 3 (Mediação Individual) para quando o diálogo não for suficiente
- [x] 3.5 Implementar a tela de recomendação do Passo 4 (Câmara Coletiva) com as orientações sobre pré-círculos e voluntariedade
- [x] 3.6 Conectar os botões de ação de cada etapa para navegar de forma fluida pelo `WizardFlow`

## 4. Ajustes Finais e Privacidade

- [x] 4.1 Garantir que todo estado de digitação sensível do Wizard seja limpo quando o componente for desmontado (não persistir queixas no banco)
- [x] 4.2 Aplicar estilizações de acordo com o design system do Tekuá (cores e fontes baseadas no Tema do projeto)
- [x] 4.3 Realizar testes manuais nos fluxos (Agente e Wizard) para garantir que ambos funcionam perfeitamente
