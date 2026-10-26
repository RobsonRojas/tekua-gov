# Teste em produção: convocação de círculo restaurativo (tarefa 7.8)

Este roteiro verifica o fluxo completo em produção (https://tekua-gov.vercel.app), depois da migração `20261026000000_restorative_circles` e da publicação das funções `api-governance` e `notify-engine`.

## ⚠️ Antes de começar

- **Uma convocação criada em produção envia email e notificação para TODOS os membros da vila.** Só execute os passos 2 e 3 com a vila avisada, ou em um momento combinado com quem coordena a comunidade.
- Use títulos claramente marcados como teste, por exemplo `TESTE — ignorar`, e cancele a convocação ao final (passo 9).
- Não inclua nomes de pessoas, emails ou dados reais nos campos de teste.

## Pessoas e contas necessárias

| Papel | O que usar | Para quê |
| --- | --- | --- |
| Membro A (autor) | Conta de membro comum, com email acessível | Criar e encerrar a convocação |
| Membro B (vila) | Conta de membro comum, com email acessível e PWA instalado com push ativo | Receber email, notificação e push |
| Administrador | Conta com perfil `admin` | Cancelar convocação e ver a aba do painel |
| Visitante | Janela anônima, sem login | Conferir que o link pede login |

Dispositivo sugerido para o push: Android com Chrome, com o app instalado pela opção "Instalar aplicativo" do navegador. Desktop Chrome instalado também serve.

## Roteiro

Marque cada resultado: ✅ como esperado, ❌ diferente (anote o que aconteceu).

### 1. Validação do formulário (sem enviar nada)

1. Entre como **Membro A** e abra o wizard de justiça restaurativa, passo 4 ("Câmara Coletiva").
2. Clique em **"Entendido, vou convocar"**.
3. **Esperado:** aparece o formulário com o aviso "Esta convocação é visível a toda a vila. Não inclua endereços de email…".
4. Digite no tema um endereço de email (ex.: `teste@exemplo.org`).
5. **Esperado:** aparece o alerta "Remova os endereços de email do tema e da descrição." e o botão "Convocar círculo" não cria a convocação.
6. Troque o tema por um texto sem email, escolha uma data **passada**, e clique em "Convocar círculo".
7. **Esperado:** mensagem "A data e o horário precisam ser futuros." e nada é criado.
8. Mantenha a data passada e desmarque as duas confirmações; tente enviar.
9. **Esperado:** mensagens pedindo as confirmações dos pré-círculos e de que a descrição não identifica as partes.

### 2. Criação da convocação (envia para a vila)

Só execute com a vila avisada.

1. Como **Membro A**, preencha: tema `TESTE — ignorar`, descrição `Teste de fluxo`, data **futura** (ex.: daqui a 3 dias), local vazio, e marque as duas confirmações.
2. Clique em **"Convocar círculo"**.
3. **Esperado:** aparece "Convocação criada. A vila foi avisada por email e notificação." e um campo com o link `…/share/circle/<código>`. Copie o link.

### 3. Recebimento pela vila

Como **Membro B** (em até alguns minutos):

1. **Email:** conferir a caixa de entrada.
   - **Esperado:** assunto `Convite: Círculo Restaurativo - TESTE — ignorar`, com a data e o horário e o botão para o link. O corpo **não** mostra a descrição.
2. **Notificação in-app:** abrir o sino de notificações do app.
   - **Esperado:** notificação "Círculo Restaurativo convocado", com link para a convocação.
3. **Push (PWA instalado):** com o app fechado ou em segundo plano.
   - **Esperado:** notificação do sistema "Círculo Restaurativo convocado · <data>".
4. Tocar na notificação push.
   - **Esperado:** o app abre na página `/share/circle/<código>` com os detalhes da convocação.

### 4. Link de compartilhamento

1. **Com sessão (Membro B):** abrir o link copiado.
   - **Esperado:** título, data e horário, descrição e status "Aberta". Se o local for um link `https://`, aparece como link clicável.
2. **Visitante (janela anônima):** abrir o mesmo link.
   - **Esperado:** é redirecionado para a tela de login, sem ver os detalhes da convocação.
3. **Código inválido:** abrir `…/share/circle/codigo-que-nao-existe` com sessão.
   - **Esperado:** "Convocação não encontrada." e nenhum outro dado.

### 5. Destaque no dashboard

1. Como **Membro B**, abrir a página inicial (Home).
   - **Esperado:** um bloco destacado "Círculo Restaurativo convocado" com o tema, a data e o botão "Ver convocação" que leva ao link.
2. Como **Membro A**, abrir a Home.
   - **Esperado:** o mesmo destaque.

### 6. Regra de uma convocação aberta por autor

1. Como **Membro A**, abrir o formulário de convocação de novo e tentar criar outra (data futura, sem email).
2. **Esperado:** mensagem "You already have an open restorative circle" (ou a tradução equivalente). Nada é criado e não há email novo.

### 7. Encerramento pelo autor

1. Como **Membro A**, abrir o link da convocação de teste e localizar a ação de encerrar.
   - *Observação: a página de compartilhamento mostra só os detalhes. Se não houver ação de encerrar para o autor nesta tela, registre isso e siga para o passo 8 pelo painel do administrador.*
2. **Esperado:** a convocação passa a "Encerrada" e sai do destaque da Home.

### 8. Painel do administrador

1. Como **Administrador**, abrir o painel e a aba **"Convocações"**.
   - **Esperado:** a lista mostra a convocação de teste, com status, autor (nome) e datas.
2. Como **Membro A** (que não é admin), conferir que a aba não aparece no painel.
   - **Esperado:** o painel não é acessível para membro comum.

### 9. Cancelamento pelo administrador e limpeza

1. Como **Administrador**, na aba "Convocações", clicar em **"Cancelar"** na convocação de teste e confirmar.
   - **Esperado:** status "Cancelada"; o destaque some da Home de todos os membros.
2. Abrir o link da convocação cancelada (com sessão).
   - **Esperado:** status "Cancelada".
3. Confirmar que a convocação de teste não aparece mais no destaque da Home do Membro B.

## Registro dos resultados

| Passo | Resultado (✅/❌) | Observação |
| --- | --- | --- |
| 1. Validação do formulário | | |
| 2. Criação | | |
| 3.1 Email | | |
| 3.2 Notificação in-app | | |
| 3.3 Push no PWA | | |
| 3.4 Abrir pelo push | | |
| 4.1 Link com sessão | | |
| 4.2 Link sem sessão | | |
| 4.3 Código inválido | | |
| 5. Destaque na Home | | |
| 6. Uma convocação por autor | | |
| 7. Encerramento pelo autor | | |
| 8. Painel do admin | | |
| 9. Cancelamento e limpeza | | |

## Se algo falhar

- **Email ou notificação não chegam:** verifique a fila de emails no painel do administrador. Falhas por destinatário não interrompem o envio aos demais.
- **Push não chega:** confirme que o app está instalado e que o membro ativou as notificações. A falha de um dispositivo não afeta os outros.
- **Erro ao criar:** anote a mensagem exata que aparece no formulário.
- **Rollback:** se for necessário desfazer, cancele a convocação pelo painel. O código pode voltar ao commit anterior (`5c0c48e`); a migração pode permanecer, pois não afeta os demais fluxos.
