## 1. Ajustes no Banco de Dados (RPC e RLS)

- [x] 1.1 Localizar a RPC `confirm_activity` ou equivalente no banco de dados e garantir que usuários do tipo `council` e `admin` possuam permissão para validar tarefas com `validation_method = 'community_consensus'`.
- [x] 1.2 Atualizar políticas RLS das tabelas envolvidas na validação se for necessário para garantir acesso a esses papéis.

## 2. Ajustes na Interface de Validação (Frontend)

- [x] 2.1 Identificar o componente de UI do cartão de demanda (ex: `WorkCard.tsx` ou similar).
- [x] 2.2 Adicionar uma condicional renderizando um campo numérico (Input) para `validation_threshold` apenas quando o usuário logado for `admin`.
- [x] 2.3 Implementar a função para atualizar o número de validações necessárias via chamada de API/Supabase quando o administrador salvar ou alterar esse campo.
- [x] 2.4 Testar o clique no botão de confirmar trabalho sendo um membro do conselho para verificar se o bug foi de fato mitigado pelas mudanças no banco/backend.
