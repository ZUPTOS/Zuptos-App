# Components Tests

Foco em componentes compartilhados (`@/components`).

- Use Testing Library para interação real (cliques, teclado).
- Priorize acessibilidade (`getByRole`, `getByLabelText`).
- Quando mockar: limitar a mocks de dependências externas (ex.: Date APIs, fetch) e evitar mocks pesados do próprio componente.
- Cobrir:
  - Render básico
  - Props variáveis/condicionais
  - Estados de loading/erro/empty (quando aplicável)
  - Eventos (onClick/onChange) e side effects esperados
