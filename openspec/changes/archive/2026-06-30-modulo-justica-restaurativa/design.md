## Context

A ecovila Tekuá possui um Protocolo de Justiça Restaurativa focado na cura de relações e reparação de danos. Atualmente, esse processo depende do conhecimento prévio do manual ou da intervenção direta de membros experientes. Com a inclusão de um módulo digital no Tekua Gov, os usuários poderão consultar e iniciar os passos do protocolo de forma guiada, promovendo a autonomia, a prática da CNV (Comunicação Não Violenta) e reduzindo a sobrecarga dos facilitadores em conflitos primários.

## Goals / Non-Goals

**Goals:**
- Integrar um fluxo guiado (Wizard) mapeando a árvore de decisão dos 5 passos do protocolo.
- Implementar um Agente Conversacional (IA) treinado com as regras específicas do protocolo e CNV para oferecer escuta empática e direcionamento.
- Armazenar o estado das orientações quando relevante, garantindo sigilo total, ou não armazenar histórico detalhado para preservar a confidencialidade.

**Non-Goals:**
- Substituir facilitadores humanos nas etapas de mediação (Passo 3) ou na Câmara de Justiça Restaurativa (Passo 4). O sistema servirá para orientar a preparação e convocar os processos.
- Resolver juridicamente os conflitos. O sistema atua no nível comunitário/restaurativo.

## Decisions

1. **Abordagem Dual (Agente IA + Wizard)**
   - *Rationale*: Diferentes usuários têm diferentes necessidades e perfis. Alguns precisam desabafar e receber orientações empáticas em linguagem natural (Agente IA), enquanto outros preferem uma abordagem estruturada e direta de triagem com opções de clique (Wizard).

2. **Integração de IA Generativa**
   - *Rationale*: Utilizar a infraestrutura já existente de IA no projeto (ex: integrações Supabase Edge Functions + OpenAI/Gemini) com um System Prompt extremamente restritivo baseado no conteúdo do `Protocolo de Justiça Restaurativa da Tekuá.txt`.
   - *Risco Mitigado*: A IA não pode inventar passos ou julgar quem está certo. O prompt deve focar na extração de necessidades (CNV) e encaminhamento para os passos 1 e 2 primariamente.

3. **Confidencialidade de Dados (Privacy-First)**
   - *Rationale*: Como o Passo 1 exige auto-reflexão e o protocolo condena fofoca/triangulação, as conversas com o Agente de IA e as respostas do Wizard não devem ser visíveis para administradores ou para a outra parte. O armazenamento deve ser estritamente vinculado ao usuário logado ou até mesmo efêmero (apagado após a sessão).

## Risks / Trade-offs

- [Alucinação da IA] → O agente pode tentar "resolver" o problema atuando como um juiz. *Mitigação*: System prompt focado apenas em fazer perguntas (maiêutica) e sugerir a leitura/prática dos passos do protocolo.
- [Privacidade e Dados Sensíveis] → Vazamento de queixas sobre outros moradores. *Mitigação*: Armazenamento com RLS (Row Level Security) rigoroso no Supabase, permitindo apenas que o próprio usuário leia seus registros, ou adoção de sessões não-persistentes.
