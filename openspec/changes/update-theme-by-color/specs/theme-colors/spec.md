## ADDED Requirements

### Requirement: Atualização do Tema Base com a Nova Paleta
O sistema DEVE prover um esquema de cores baseado na imagem `cores.jpeg`, mapeando as novas cores para as propriedades nativas do Material-UI.

#### Scenario: Tema Light Ativo
- **WHEN** o usuário seleciona ou seu sistema estiver configurado para o tema Light
- **THEN** a interface renderiza utilizando `primary` verde floresta (`#467048`) e `secondary` laranja mostarda (`#da8923`), com fundos claros (padrão MUI) que mantenham contraste com essas cores.

#### Scenario: Tema Dark Ativo
- **WHEN** o usuário seleciona ou seu sistema estiver configurado para o tema Dark
- **THEN** a interface renderiza utilizando a cor base de fundo modificada para o verde muito escuro (`#262a18`), com texto ajustado para alto contraste e as mesmas cores de marca (`primary` e `secondary`).
