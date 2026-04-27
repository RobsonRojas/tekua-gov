## ADDED Requirements

### Requirement: Resiliência na Instalação de Dependências
O ambiente de desenvolvimento e build SHALL ser configurado para resolver conflitos de dependências de par (peer dependencies) de forma automática quando estes forem aceitáveis para a integridade do sistema, garantindo a continuidade do pipeline de CI/CD.

#### Scenario: Instalação no Vercel com Conflitos de Peer Dependencies
- **WHEN** o comando `npm install` é executado em um ambiente de build (como Vercel)
- **THEN** o sistema SHALL utilizar a configuração `legacy-peer-deps` para resolver conflitos e prosseguir com a instalação sem erros.
