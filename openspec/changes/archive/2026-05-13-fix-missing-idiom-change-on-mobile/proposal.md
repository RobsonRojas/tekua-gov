## Why

Atualmente, o seletor de idioma no dispositivo móvel está localizado no final do `MobileDrawer` com uma margem automática (`mt: 'auto'`). Em dispositivos com telas menores ou quando o menu de navegação é extenso, este componente pode ser empurrado para fora da área visível (overflow), impossibilitando a troca de idioma por usuários mobile. Garantir a visibilidade deste recurso é essencial para a acessibilidade e internacionalização da plataforma.

## What Changes

- Reposicionamento do `LanguageSelector` no `MobileDrawer` para garantir visibilidade permanente.
- Ajuste do layout do drawer para evitar que itens de utilidade (como idioma e logout) sejam ocultados por transbordamento de conteúdo.
- Verificação da visibilidade do seletor em diferentes resoluções mobile (emulação de 360px a 420px de largura).

## Capabilities

### New Capabilities
- `mobile-utility-visibility`: Garante que ferramentas globais (idioma, tema, logout) estejam sempre acessíveis no padrão de navegação mobile.

### Modified Capabilities
- `navigation-interface`: Ajuste dos requisitos de posicionamento de utilitários no Mobile Drawer.

## Impact

- `src/components/Navigation/MobileDrawer.tsx`: Reorganização dos componentes internos.
- UX: Facilidade de troca de idioma para usuários mobile em qualquer tamanho de tela.
