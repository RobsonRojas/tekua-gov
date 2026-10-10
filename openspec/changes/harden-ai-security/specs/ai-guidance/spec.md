## MODIFIED Requirements

### Requirement: Personalidade e Segurança
O sistema SHALL assegurar que o agente mantenha uma postura ética e instrutiva. A proteção contra injeções de comandos maliciosos SHALL ser assegurada pela parametrização da API de IA (Safety Settings) e instruções estritas no System Prompt, evitando validações heurísticas (RegEx) no backend. Toda sanitização de markdown (XSS) contra injeções web SHALL ser realizada estritamente na camada de renderização do Frontend, permitindo que a Edge Function processe o texto bruto de forma não-modificada.

#### Scenario: Prevenção de Injeção e Jailbreak
- **WHEN** o usuário envia instruções para o agente ignorar as regras de segurança e agir de forma maliciosa.
- **THEN** o modelo de IA, configurado com Safety Settings estritos e blindagem de prompt, rejeita ativamente o comando sem processá-lo.

#### Scenario: Proteção contra Cross-Site Scripting
- **WHEN** o modelo de IA responde contendo tags HTML maliciosas (ex: `<script>alert(1)</script>`) originadas de contexto ou resposta do chat.
- **THEN** o sistema frontend renderiza a mensagem expurgando o código executável através de sanitizadores de DOM (DOMPurify ou equivalente), exibindo a mensagem de forma segura.
