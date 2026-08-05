## 1. Backend / API

- [ ] 1.1 Atualizar os tipos de dados e a API de criação de demanda no `api-work` para aceitar `fiat_amount`, `currency`, `payment_method`, e `payment_status`.
- [ ] 1.2 Adicionar validação de entrada para o valor em BRL e a moeda suportada (`BRL`).
- [ ] 1.3 Implementar a integração inicial com Stripe para criar um `payment_intent` ou `checkout_session` ao criar/confirmar a demanda, mantendo o valor em fiat como parte do registro da atividade.
- [ ] 1.4 Atualizar a API de perfil de usuário para permitir armazenar e buscar dados Pix: `pix_key`, `pix_holder_name`, `pix_holder_document`, `bank_name`, `account_type`.
- [ ] 1.5 Garantir que apenas o próprio usuário possa atualizar seus dados Pix e que esses campos sigam as regras de privacidade e RLS do banco.

## 2. Frontend

- [ ] 2.1 Atualizar `src/pages/CreateDemand.tsx` para incluir um campo de valor a pagar em BRL e um seletor/indicador de moeda fiat.
- [ ] 2.2 Adicionar uma seção no `src/pages/Profile.tsx` para que o usuário cadastre seus dados Pix e veja o status de recebimento.
- [ ] 2.3 Atualizar `src/pages/TaskDetail.tsx` para exibir o valor fiat da demanda, o status do pagamento e a chave Pix do executor quando a entrega for completada.
- [ ] 2.4 Ajustar `src/components/ActivityCard.tsx` para mostrar o valor fiat e a indicação de pagamento via Pix em cards de demanda.

## 3. UX / fluxos

- [ ] 3.1 Documentar no frontend que o pagamento de demandas enviadas será realizado via Pix para a chave cadastrada pelo executor.
- [ ] 3.2 Exibir instruções claras quando a demanda for entregue, incluindo um botão ou link para iniciar o pagamento via Pix.
- [ ] 3.3 Garantir feedback ao usuário quando os dados Pix forem salvos com sucesso no perfil.

## 4. Testes e validação

- [ ] 4.1 Adicionar testes de integração para criação de demanda com valor fiat e armazenamento de dados Pix no perfil.
- [ ] 4.2 Adicionar testes end-to-end para o fluxo de demanda entregue e pagamento via Pix.
- [ ] 4.3 Verificar os efeitos de borda com demandas sem valor fiat e com executores sem dados Pix configurados.
