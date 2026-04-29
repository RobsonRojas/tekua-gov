## Context

A implementação anterior de notificações via banco de dados introduziu uma dependência estrita de configurações SQL (`app.settings.*`). Em ambientes Supabase, esses parâmetros precisam ser configurados manualmente via `ALTER DATABASE` ou em cada transação, caso contrário, o Postgres lança um erro `unrecognized configuration parameter`.

## Goals / Non-Goals

**Goals:**
- Impedir que erros de configuração de notificação causem falhas em operações de escrita (Tasks/Demands).
- Permitir que a trigger detecte se o motor de notificações está configurado antes de tentar chamá-lo.

**Non-Goals:**
- Mudar o provedor de notificações (Resend/Push).
- Remover a funcionalidade de notificações em tempo real.

## Decisions

### 1. Uso de Parâmetros Opcionais no Postgres
- **Decisão**: Utilizar `current_setting('param', true)` em vez de `current_setting('param')`.
- **Racional**: O segundo argumento `true` (missing_ok) faz com que a função retorne `NULL` em vez de lançar uma exceção caso o parâmetro não exista.

### 2. Guard Clause na Trigger
- **Decisão**: Adicionar uma verificação `IF (url IS NOT NULL AND key IS NOT NULL) THEN ... END IF;`.
- **Racional**: Evita chamadas inválidas ao `net.http_post` com URLs nulas e fornece um ponto de saída seguro caso a infraestrutura não esteja pronta.

### 3. Log de Diagnóstico
- **Decisão**: Usar `RAISE WARNING` quando as configurações estiverem ausentes.
- **Racional**: Permite que desenvolvedores identifiquem por que as notificações não estão chegando através dos logs do Postgres, sem afetar a experiência do usuário final.

## Risks / Trade-offs

- **Risco**: Notificações podem "sumir" silenciosamente se os parâmetros forem deletados.
    - **Mitigação**: O log de `WARNING` no Postgres servirá como trilha de auditoria para depuração.
