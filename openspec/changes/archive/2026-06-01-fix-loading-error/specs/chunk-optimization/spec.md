## MODIFIED Requirements

### Requirement: Otimização de Chunks e Code-Splitting do Vite
O sistema SHALL instruir o rollup (através das configurações do Vite) a isolar bibliotecas pesadas de `node_modules` em diferentes pacotes de tamanho reduzido, garantindo que não existam ciclos ou dependências circulares entre esses chunks.

#### Scenario: Build de Produção
- **WHEN** o comando `npm run build` ou o bundle de produção for gerado
- **THEN** o compilador deve identificar pacotes como `@mui`, `react` e `recharts`, dividi-los e nomeá-los adequadamente em `dist/assets/`, eliminando a ocorrência de avisos limitadores (chunks > 500kB) no log do terminal, e a compilação final não deve emitir avisos de dependências circulares entre chunks.

#### Scenario: Carregamento do Aplicativo
- **WHEN** o aplicativo for carregado no navegador em ambiente de produção
- **THEN** a importação de React e demais dependências deve ocorrer sem erros de referência circular (como "Cannot read properties of undefined (reading 'createContext')"), garantindo o boot completo e sem exceções da aplicação.
