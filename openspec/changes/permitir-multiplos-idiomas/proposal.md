## Why

O portal Tekua precisa ser acessível a um público internacional, começando com suporte para Português e Inglês. Atualmente, o sistema é estático em um único idioma. Além da interface, é necessário que os dados cadastrados (como descrições e títulos) possam ser armazenados e visualizados em múltiplos idiomas de forma escalável.

## What Changes

O sistema será atualizado para suportar internacionalização (i18n) tanto na interface quanto na persistência de dados.
- Implementação de um framework de i18n no frontend (ex: `react-i18next`).
- Criação de um seletor de idiomas na interface.
- Reestruturação ou adição de suporte a Traduções no banco de dados para campos de texto dinâmicos.
- Suporte inicial para Português (pt-BR) e Inglês (en-US), com arquitetura preparada para novos idiomas.

## Capabilities

### New Capabilities
- `i18n-interface`: Gerenciamento de traduções de UI, troca de contexto de idioma e persistência da preferência do usuário.
- `multilingual-content`: Suporte a armazenamento de dados em múltiplos idiomas no PostgreSQL, permitindo que campos específicos tenham tradução.

### Modified Capabilities
- `user-profile`: Adição da preferência de idioma no perfil do usuário.

## Impact

- **Frontend**: Introdução de dependências de i18n, wrapping da aplicação em provedores de tradução.
- **Banco de Dados**: Novas tabelas de tradução ou alteração de colunas existentes para tipos JSONB ou estruturas relacionais de internacionalização.
- **API/Supabase**: Atualização de consultas para retornar o conteúdo no idioma solicitado.
