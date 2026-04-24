## MODIFIED Requirements

### Requirement: Plataforma de Deliberação (voting-system)
Os comentários em pautas **MUST** suportar a estrutura multilíngue da plataforma.

#### Scenario: Submissão de comentário localizado
- **WHEN** O usuário envia um comentário.
- **THEN** O sistema armazena o conteúdo em um campo JSONB, utilizando o idioma atual da interface como chave.

### Requirement: Transferência P2P (wallet-system)
As transações financeiras oriundas de atividades de governança **MUST** manter rastreabilidade direta.

#### Scenario: Rastreabilidade de recompensa
- **WHEN** Um pagamento automático é gerado por uma atividade concluída.
- **THEN** A transação resultante deve possuir um vínculo (`activity_id`) com o registro original da atividade.
