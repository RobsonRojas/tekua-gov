## ADDED Requirements

### Requirement: Saldo total, reservado e disponível
A carteira SHALL expor saldo total, saldo reservado e saldo disponível (total menos reservado). Transferências, novos cadastros com reserva e ajustes administrativos de débito MUST respeitar o saldo disponível, e a interface da carteira MUST exibir os três valores.

#### Scenario: Transferência acima do disponível
- **WHEN** um membro com saldo total 100 e reservado 70 tenta transferir 50
- **THEN** a transferência é recusada por saldo insuficiente

#### Scenario: Exibição na carteira
- **WHEN** o membro abre a carteira com saldo total 100 e reservado 70
- **THEN** a tela mostra total 100, reservado 70 e disponível 30
