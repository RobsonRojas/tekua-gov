## ADDED Requirements

### Requirement: Otimização de Chunks e Code-Splitting do Vite
O sistema DEVE instruir o rollup (através das configurações do Vite) a isolar bibliotecas pesadas de `node_modules` em diferentes pacotes de tamanho reduzido.

#### Scenario: Build de Produção
- **WHEN** o comando `npm run build` ou o bundle de produção for gerado
- **THEN** o compilador deve identificar pacotes como `@mui`, `react` e `recharts`, dividi-los e nomeá-los adequadamente em `dist/assets/`, eliminando a ocorrência de avisos limitadores (chunks > 500kB) no log do terminal.
