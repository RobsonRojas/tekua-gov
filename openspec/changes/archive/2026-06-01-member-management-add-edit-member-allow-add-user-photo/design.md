## Context

O sistema Tekuá possui um mural de tarefas (Work Wall) e um painel de gerenciamento de membros. Para enriquecer a experiência e identificação dos membros, é necessário permitir a associação de fotos de perfil (avatar). Atualmente, a tabela `profiles` possui a coluna `avatar_url`, mas não há interface para envio de fotos nos fluxos de convite de novo membro ou na edição administrativa dos perfis.

## Goals / Non-Goals

**Goals:**
- Permitir que administradores adicionem uma foto ao convidar um membro em `NewMemberModal`.
- Permitir que administradores adicionem, editem ou removam a foto de membros em `MemberEditModal`.
- Exibir a foto do membro nos componentes `<Avatar>` da lista de membros e na página de detalhes do perfil.
- Configurar armazenamento no Supabase Storage para fotos de membros de forma otimizada.

**Non-Goals:**
- Permitir que membros não-administradores alterem fotos de outros membros (apenas seus próprios avatares podem ser alterados pelo próprio usuário no perfil pessoal, o que já é coberto ou está fora do escopo administrativo atual).
- Permitir uploads de arquivos não-imagem (limitar a JPEG, PNG, WEBP).

## Decisions

### 1. Novo Bucket de Armazenamento: `member-photos`
- **Escolha**: Criar um bucket público `member-photos` via migração do Supabase.
- **Políticas RLS**:
  - Leitura pública (qualquer um pode ler as fotos).
  - Escrita (Insert/Update/Delete) apenas por usuários cuja `role` seja `admin` na tabela `profiles`.
- **Alternativa Considerada**: Utilizar o bucket existente `task-evidence`. Foi descartada porque `task-evidence` é voltada a evidências de tarefas concluídas, possuindo outras politicas de expiração ou acesso que podem divergir da longevidade e finalidade das fotos de perfil.

### 2. Otimização e Compactação no Cliente
- **Abordagem**: Utilizar a biblioteca `browser-image-compression` para reduzir o tamanho de todas as fotos de perfil a no máximo 1MB e resolução máxima de 800x800px antes do upload.
- **Vantagem**: Reduz o consumo de storage no Supabase e acelera o tempo de boot e carregamento das listas de membros e mural.

### 3. Integração com a Deno Edge Function (`api-members`)
- **Mudança na Edge Function**: Estender o payload da ação `inviteMember` para receber e incluir `avatar_url` no campo `data` do convite (`inviteUserByEmail`). O trigger `handle_new_user` copiará o `avatar_url` de `raw_user_meta_data` diretamente para a tabela `profiles`.
- **Atualização**: A ação `adminUpdateProfile` já propaga dinamicamente campos não protegidos do objeto `updates`, exigindo zero alterações no Deno Edge Function para a edição de foto de membros existentes.

### 4. Componente de Upload e Preview Visual no UI
- **Design**: Inserir um seletor visual de foto acima dos campos de dados do formulário nos modais, exibindo um preview circular interativo com um ícone de câmera/lápis para alteração e um botão de remoção rápida.

## Risks / Trade-offs

- **[Risco]** Uploads excessivos ou órfãos no storage se a imagem for enviada mas o formulário for cancelado.
- **[Mitigação]** Faremos o upload somente no momento da submissão do formulário ("Enviar" ou "Salvar"), garantindo que arquivos temporários não sejam acumulados de forma desnecessária, ou adotando nomes de arquivos baseados em UUIDs determinísticos de forma a substituir fotos antigas.
