## 1. Configuração do Framework i18n

- [x] 1.1 Instalar dependências: `npm install i18next react-i18next i18next-browser-languagedetector`.
- [x] 1.2 Criar arquivo de configuração `src/lib/i18n.ts`.
- [x] 1.3 Configurar o carregamento de recursos (backend de tradução) ou importar arquivos JSON estáticos.
- [x] 1.4 Importar a configuração do i18n no ponto de entrada da aplicação (`src/main.tsx`).

## 2. Tradução da Interface

- [x] 2.1 Criar estrutura de pastas: `public/locales/pt/translation.json` e `public/locales/en/translation.json`.
- [x] 2.2 Extrair strings de texto do componente `Login.tsx` para os arquivos de tradução.
- [x] 2.3 Extrair strings de texto do componente `Profile.tsx` para os arquivos de tradução.
- [x] 2.4 Extrair strings de texto do componente `AdminPanel.tsx` para os arquivos de tradução.
- [x] 2.5 Substituir textos estáticos pelo hook `useTranslation` nos componentes.

## 3. Banco de Dados e API

- [x] 3.1 Criar migração para adicionar `preferred_language` na tabela `profiles`.
- [x] 3.2 Atualizar o `AuthContext` para carregar e aplicar o idioma salvo no perfil após o login.
- [x] 3.3 (Pesquisa) Identificar tabelas de conteúdo que precisam de conversão para campos JSONB multilíngues.

## 4. Componentes de Interface (UI)

- [x] 4.1 Desenvolver o componente `LanguageSelector` (seletor de bandeiras ou dropdown).
- [x] 4.2 Integrar o `LanguageSelector` na `AppBar` global.
- [x] 4.3 Garantir que a troca de idioma salve a preferência no LocalStorage e no perfil (se autenticado).

## 5. Verificação e Testes

- [x] 5.1 Verificar se a detecção automática do navegador funciona.
- [x] 5.2 Testar a troca manual de idioma e persistência entre sessões.
- [x] 5.3 Validar se as mensagens de erro do Supabase também podem ser mapeadas para traduções.

- [x] Implementar testes unitários para o seletor de idiomas e i18n helper (Vitest).
- [x] Implementar testes Playwright para validar a troca de idioma e persistência.
