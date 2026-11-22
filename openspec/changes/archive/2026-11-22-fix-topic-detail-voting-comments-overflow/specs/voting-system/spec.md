## MODIFIED Requirements

### Requirement: Sistema de Votação Formal
O sistema SHALL permitir que membros exerçam seu direito de voto de forma segura e única, apenas em pautas abertas. O registro do voto DEVE atualizar a marcação temporal (`updated_at`) sem quebras de schema ou incompatibilidades na persistência dos votos.

#### Scenario: Votação Única
- **WHEN** um membro autenticado seleciona uma opção (Sim, Não, Abstenção) e confirma seu voto.
- **THEN** o sistema registra o voto associado ao seu ID e atualiza `updated_at`, impedindo que ele vote novamente no mesmo tema e sem retornar erro 400 de coluna inexistente.

#### Scenario: Voto em Pauta Recém-Criada
- **WHEN** um membro vota em uma pauta com status `open`.
- **THEN** o sistema aceita o voto com sucesso.

#### Scenario: Voto em Pauta Encerrada
- **WHEN** um membro tenta votar em uma pauta com status `closed`.
- **THEN** o sistema rejeita o voto informando que a pauta não aceita mais votos.

#### Scenario: Apuração de Resultados
- **WHEN** uma votação é encerrada (tempo expirado ou ação do admin).
- **THEN** o sistema calcula as porcentagens de cada opção e exibe o resultado final para todos os membros.

## ADDED Requirements

### Requirement: Responsividade e Contenção de Layout na Descrição da Pauta
A área de exibição da descrição e conteúdo da pauta SHALL conter todo o texto, palavras longas, links e tags HTML dentro dos limites horizontais do card, impedindo vazamentos para fora da tela ou rompimento de layout.

#### Scenario: Descrição com Textos Longos ou Sequências Contínuas
- **WHEN** uma pauta possui palavras longas sem espaços, URLs ou texto extenso no corpo da pauta
- **THEN** o container aplica quebra de linha forçada (`break-word`) e limita a largura máxima a 100%, mantendo todo o conteúdo contido visualmente no card.

### Requirement: Feedback Detalhado no Envio de Comentários
Ao submeter um comentário ou resposta na pauta, o sistema SHALL prover tratamento de erros com exibição de mensagem clara e amigável em caso de falha.

#### Scenario: Erro ao Enviar Comentário
- **WHEN** a API recusa a gravação de um comentário ou ocorre uma falha na requisição
- **THEN** o sistema exibe feedback de erro com o motivo retornado pela API ou mensagem amigável no Snackbar/interface, sem travar silenciosamente.
