## 1. Migração de Banco de Dados

- [x] 1.1 Criar nova tabela `audit_logs_partitioned` com suporte a particionamento nativo por range de data.
- [x] 1.2 Migrar dados da tabela `audit_logs` antiga para a nova estrutura particionada.
- [x] 1.3 Renomear tabelas para que a nova estrutura assuma o nome `audit_logs`.

## 2. Automação de Manutenção

- [x] 2.1 Criar função PL/pgSQL `manage_audit_partitions()` para criar partições futuras.
- [x] 2.2 Criar função `archive_old_audit_logs()` para mover partições antigas para o esquema de arquivo.
- [x] 2.3 Agendar a execução mensal destas funções usando `pg_cron`.

## 3. Visualização e Consulta

- [x] 3.1 Criar view `vw_audit_logs_all` que une as tabelas ativas e arquivadas.
- [x] 3.2 Atualizar a interface administrativa de visualização de logs para permitir filtros por data que alcancem o arquivo.

## 4. Verificação

- [x] 4.1 Testar a criação manual de uma partição para o próximo mês.
- [x] 4.2 Validar que a remoção de uma partição antiga não afeta a integridade dos dados ativos.
- [x] 4.3 Verificar performance de consulta na view com grandes volumes de dados simulados.
