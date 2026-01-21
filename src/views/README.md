# Views

Telas/páginas de domínio (admin, dashboard, produtos, usuários, etc.).

- **Padrão**
  - Cada view é um componente React/Next com layout pronto (geralmente envolve `DashboardLayout`).
  - Lógica de UI localizada; componentes compartilhados devem vir de `@/components`.
  - Use mocks de `@/data` enquanto não houver API real.

- **Estilo**
  - Respeitar tokens (`bg-card`, `text-foreground`) e gradiente primário em ações.
  - Paginação: usar `PaginatedTable` ou seguir o mesmo padrão de setas + índices.
  - Checkboxes: mesma customização (fundo primário + ✓) e cantos ≤ 7px.

- **Navegação**
  - `useRouter` (Next) para transições internas; mantenha links/rotas claras.
  - Rotas administrativas ficam sob `/admin/...`.

- **Acessibilidade**
  - Títulos/labels claros, botões de ícone com `aria-label`.
  - Estados de loading/empty/erro devem ser comunicados visualmente.
