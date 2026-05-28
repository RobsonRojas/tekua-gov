## Context

O frontend do Tekuá Gov utiliza Material-UI (MUI) para prover temas claro e escuro. Com a nova direção de identidade visual, precisamos traduzir os códigos hexadecimais fornecidos em um mapeamento consistente de paleta para os temas. As cores são originárias da imagem de referência (`cores.jpeg`).

## Goals / Non-Goals

**Goals:**
- Mapear e implementar os códigos de cor extraídos da imagem nos tokens de cor do MUI.
- Atualizar a configuração global `createTheme` em `src/theme/index.ts` (ou equivalente) para aplicar os novos tokens.
- Manter suporte robusto tanto para o modo Light quanto para o modo Dark.

**Non-Goals:**
- Refatorar componentes individualmente (a menos que possuam cores hardcoded ao invés de usar `theme.palette`).
- Mudanças de layout estrutural na aplicação.

## Decisions

**Mapeamento da Paleta (Proposto):**
- **Primary:** Verde Floresta (`#467048`)
- **Secondary:** Laranja Mostarda (`#da8923`)
- **Background (Dark Mode):** Verde muito escuro (`#262a18`) em vez do fundo preto/cinza padrão, o que cria um Dark Mode focado na identidade.
- **Background (Light Mode):** Cores de base claras com detalhes em Verde Oliva Claro (`#a2a45e`) ou Marrom/Taupe (`#5f5142`) para contrastes de cards.
- **Error/Destructive:** Vermelho Carmesim (`#8d0c09`).

Essa decisão alinha o esquema visual da aplicação aos exatos tons solicitados pela referência, trazendo os tons mais escuros para o modo noturno.

## Risks / Trade-offs

- **[Risco] Contraste de Texto:** Algumas das cores podem não oferecer o contraste mínimo (WCAG) necessário contra texto branco ou preto. 
  - *Mitigação:* O MUI calcula as cores de contraste (`contrastText`) automaticamente por padrão se fornecermos a cor `main`, o que previne problemas de legibilidade dentro dos botões.
- **[Risco] Fundo no Dark Mode:** Usar `#262a18` no lugar de cinza escuro pode alterar a percepção de sombras e profundidade.
  - *Mitigação:* As propriedades de `paper` e elevação deverão ser ajustadas para garantir que os cards se sobressaiam no fundo colorido escuro.
