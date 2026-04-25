## ADDED Requirements

### Requirement: Retenção de Logs Ativos
O sistema **SHALL** manter os logs de auditoria dos últimos 12 meses na tabela de acesso rápido.

#### Scenario: Consulta de log recente
- **WHEN** Um administrador consulta um log de 6 meses atrás.
- **THEN** O resultado é retornado instantaneamente da tabela principal.

### Requirement: Arquivamento Automático
O sistema **SHALL** mover logs com mais de 12 meses para um armazenamento de arquivo mensalmente.

#### Scenario: Processamento de logs antigos
- **WHEN** O job de manutenção é executado.
- **AND** Existem logs com `created_at` anterior a 12 meses.
- **THEN** Esses registros são movidos para a tabela de arquivo.
- **AND** São removidos da tabela principal para liberar espaço.
