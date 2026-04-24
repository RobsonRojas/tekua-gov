## 1. Banco de Dados e Migrações

- [x] 1.1 Criar migração para adicionar `activity_id` na tabela `transactions`.
- [x] 1.2 Criar migração para converter `topic_comments.content` de TEXT para JSONB (preservando dados).
- [x] 1.3 Atualizar os tipos de banco de dados no frontend (se aplicável).

## 2. Refatoração de Lógica de Back-end (RPC)

- [x] 2.1 Atualizar `execute_currency_transfer` para preencher o novo campo `activity_id`.
- [x] 2.2 Unificar as chamadas de validação, removendo referências à tabela antiga `contributions` em favor de `activities`.
- [x] 2.3 Garantir que todos os payouts automáticos preencham a referência de atividade.

## 3. Ajustes de Frontend (UI/UX)

- [x] 3.1 Atualizar `TopicDetail.tsx` para renderizar comentários localizados.
- [x] 3.2 Adaptar o formulário de envio de comentário para enviar objeto JSONB.
- [x] 3.3 Adicionar link para a atividade correspondente no histórico de transações da carteira.

## 4. Testes e Validação

- [x] 4.1 Validar a integridade dos dados migrados (comentários antigos).
- [x] 4.2 Executar testes E2E de fluxo de contribuição -> validação -> payout e verificar o link no banco.
- [x] 4.3 Verificar se a troca de idioma reflete corretamente nos comentários.
