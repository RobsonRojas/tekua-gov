## 1. Configuração do Framework i18n

- [ ] 1.1 Instalar dependências: `npm install i18next react-i18next i18next-browser-languagedetector`.
- [ ] 1.2 Criar arquivo de configuração `src/lib/i18n.ts`.
- [ ] 1.3 Configurar o carregamento de recursos (backend de tradução) ou importar arquivos JSON estáticos.
- [ ] 1.4 Importar a configuração do i18n no ponto de entrada da aplicação (`src/main.tsx`).

## 2. Tradução da Interface

- [ ] 2.1 Criar estrutura de pastas: `public/locales/pt/translation.json` e `public/locales/en/translation.json`.
- [ ] 2.2 Extrair strings de texto do componente `Login.tsx` para os arquivos de tradução.
- [ ] 2.3 Extrair strings de texto do componente `Profile.tsx` para os arquivos de tradução.
- [ ] 2.4 Extrair strings de texto do componente `AdminPanel.tsx` para os arquivos de tradução.
- [ ] 2.5 Substituir textos estáticos pelo hook `useTranslation` nos componentes.

## 3. Banco de Dados e API

- [ ] 3.1 Criar migração para adicionar `preferred_language` na tabela `profiles`.
- [ ] 3.2 Atualizar o `AuthContext` para carregar e aplicar o idioma salvo no perfil após o login.
- [ ] 3.3 (Pesquisa) Identificar tabelas de conteúdo que precisam de conversão para campos JSONB multilíngues.

## 4. Componentes de Interface (UI)

- [ ] 4.1 Desenvolver o componente `LanguageSelector` (seletor de bandeiras ou dropdown).
- [ ] 4.2 Integrar o `LanguageSelector` na `AppBar` global.
- [ ] 4.3 Garantir que a troca de idioma salve a preferência no LocalStorage.

## 5. Verificação e Testes

- [ ] 5.1 Verificar se a detecção automática do navegador funciona.
- [ ] 5.2 Testar a troca manual de idioma e persistência entre sessões.
- [ ] 5.3 Validar se as mensagens de erro do Supabase também podem ser mapeadas para traduções.
