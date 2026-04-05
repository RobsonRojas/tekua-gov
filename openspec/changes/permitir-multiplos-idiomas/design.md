## Context

Atualmente, o portal Tekua Gov utiliza textos estáticos em Português diretamente no código. Não há suporte para múltiplos idiomas na interface nem na estrutura de dados do banco de dados (PostgreSQL/Supabase). Para expandir a atuação da associação, é vital que o sistema seja bilingue (PT/EN) e que o conteúdo dinâmico suporte traduções.

## Goals / Non-Goals

**Goals:**
- Implementar suporte a internacionalização (i18n) no frontend React.
- Traduzir toda a interface estática para Português e Inglês.
- Permitir a troca de idioma em tempo de execução via seletor na AppBar.
- Adaptar o banco de dados para suportar conteúdo traduzível em tabelas específicas.
- Persistir a preferência de idioma do usuário no Perfil e no LocalStorage.

**Non-Goals:**
- Tradução automática (via API externa como Google Translate) em tempo real.
- Suporte a idiomas RTL (Right-to-Left) nesta fase.

## Decisions

- **Framework de i18n**: Usaremos `i18next` e `react-i18next` pela sua robustez e ecossistema de plugins (detecção de idioma, backend de carregamento).
- **Traduções Estáticas**: Armazenadas em arquivos JSON em `public/locales/{{lng}}/translation.json` para facilitar a manutenção por tradutores não-desenvolvedores.
- **Internacionalização de Dados (DB)**: Para campos dinâmicos que exigem tradução (ex: avisos, descrições de projetos), utilizaremos o tipo **JSONB** no PostgreSQL (ex: `title: { "pt": "...", "en": "..." }`). Esta abordagem é flexível e evita a explosão de tabelas de tradução ("Entity-Attribute-Value" ou tabelas paralelas).
- **Detecção de Idioma**: Utilizaremos `i18next-browser-languagedetector` para sugerir o idioma baseado nas configurações do navegador no primeiro acesso.
- **Typing**: Utilizaremos recursos do TypeScript para garantir que chaves de tradução existam, evitando "missing keys" em produção.

## Risks / Trade-offs

- **Complexidade de Queries**: O uso de JSONB exige que as queries do Supabase/PostgreSQL utilizem operadores específicos para extrair o idioma correto, o que pode dificultar um pouco filtros e ordenações complexas se não planejado.
- **Aumento de Payload**: O carregamento de arquivos de tradução aumenta levemente o tempo de inicialização, mas pode ser mitigado com lazy loading de namespaces.
- **Manutenção de Dados**: Cadastrar dados em múltiplos idiomas exige que a UI de administração (Admin Panel) seja adaptada para permitir campos multi-língua.
