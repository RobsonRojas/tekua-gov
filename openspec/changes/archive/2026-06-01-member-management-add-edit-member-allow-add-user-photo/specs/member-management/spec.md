## ADDED Requirements

### Requirement: Upload e Armazenamento de Foto do Membro
O sistema SHALL permitir que administradores façam upload de uma foto de perfil (avatar) ao convidar ou editar qualquer membro da plataforma.

#### Scenario: Upload de Foto de Novo Membro no Convite
- **WHEN** o administrador preenche o formulário de "Novo Membro", seleciona uma imagem de perfil e clica em "Enviar".
- **THEN** o sistema SHALL enviar a imagem para o bucket `member-photos` no Supabase Storage, associar a URL gerada ao metadado do convite e salvá-la no campo `avatar_url` da tabela de perfis.

#### Scenario: Upload de Foto de Membro Existente na Edição
- **WHEN** o administrador edita um membro, seleciona ou altera a imagem de perfil no modal de edição e clica em "Salvar".
- **THEN** o sistema SHALL enviar a imagem para o bucket `member-photos` no Supabase Storage e atualizar o campo `avatar_url` correspondente na tabela de perfis.

#### Scenario: Exibição da Foto na Tabela de Membros e no Perfil
- **WHEN** a tabela de gestão de membros ou a página de perfil do usuário é renderizada.
- **THEN** o sistema SHALL exibir a foto contida em `avatar_url` no componente de Avatar. Se a foto não existir, o sistema SHALL exibir as iniciais do usuário como fallback.
