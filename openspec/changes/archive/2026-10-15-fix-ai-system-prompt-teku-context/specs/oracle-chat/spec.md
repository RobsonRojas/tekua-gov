# oracle-chat (Delta Spec)

## Overview

Corrigir a definição e contexto da plataforma apresentados pelo Assistente Virtual (Oráculo) para refletir adequadamente a "plataforma de governança comunitária, gestão de demandas, economia circular descentralizada e justiça restaurativa projetada para aldeias e comunidades", e forçar que o Oráculo restrinja suas respostas exclusivamente aos documentos do Gerenciador de Documentos Oficiais.

## Component: AI System Prompt

### Context

O assistente foi inicialmente programado com um prompt restrito mencionando "extrativistas da Amazônia". Como as comunidades suportadas são abrangentes, esse escopo artificial provoca respostas indesejadas. Além disso, as instruções de ancoragem (grounding) precisam ser fortalecidas.

### Delta: Context Fix & Grounding

- **Comportamento Atual:** A IA afirma ser criada para a "Amazônia" e pode responder fora do escopo estrito dos documentos.
- **Novo Comportamento:** A IA responderá com a definição genérica da plataforma e terá instruções rigorosas para que as fontes de suas respostas sejam estritamente extraídas dos documentos oficiais injetados no contexto, recusando-se a responder se a informação não constar neles.
