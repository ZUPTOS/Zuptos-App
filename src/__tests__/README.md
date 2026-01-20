# Tests (root)

Base de testes para `apps/web`.

- **Framework**: Jest + @testing-library/react (@testing-library/user-event).
- **Comandos**: `pnpm test` executa tudo com cobertura; use `pnpm test -- <pattern>` para filtrar.
- **Ambiente**: JSDOM (config em Jest).
- **Boas práticas**:
  - Preferir consultas acessíveis (`getByRole`, `getByLabelText`).
  - Cobrir estados: loading/erro/empty e interações principais.
  - Evitar snapshots de markup grande; priorize asserts em comportamento.
