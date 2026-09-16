# Proposal: Update Payment Model and Add Admin Wallet Control

## What Changes
1. Alterar a lógica de pagamento das atividades e demandas para que as recompensas sejam sempre creditadas na carteira do executor a partir da tesouraria (minting via sistema, passando `NULL` como origem no `execute_currency_transfer`), sem deduzir da carteira do criador ou beneficiário.
2. Adicionar uma interface no painel administrativo que permita aos administradores ajustar (adicionar ou remover) o saldo de surreais na carteira de qualquer membro da plataforma.
3. Criar a Edge Function e a lógica de banco de dados correspondente (se necessário) para processar o ajuste manual do saldo pelo administrador.

## Why
- O modelo anterior desencorajava membros a criar demandas importantes para a comunidade, visto que consumiria seus próprios fundos (surreais). Alterar para a emissão baseada na conclusão do trabalho reconhece o valor gerado para o ecossistema sem penalizar o criador.
- Eventualmente é necessário que administradores ajustem saldos para corrigir inconsistências ou distribuir fundos excepcionais a membros (minting e burning discricionário).
