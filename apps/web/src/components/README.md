# Components

Guia rápido para os componentes compartilhados.

- **Padrões visuais**
  - Cantos ≤ 7px em campos/botões/checkboxes.
  - Botões de ação primária em modais: gradiente `from-[#6C27D7] to-[#421E8B]`.
  - Checkboxes customizados com ✓ e fundo `bg-primary` ao marcar.
  - Use tokens: `bg-card`, `text-foreground`, `text-muted-foreground`, `border-foreground/10`.

- **Arquitetura**
  - Componentes atômicos/reutilizáveis aqui; telas ficam em `src/views`.
  - Imports absolutos com `@/components/...`.
  - Preferir props tipadas e nomes claros; evite lógica de domínio dentro do componente.

- **Referências úteis**
  - `DateFilter` – entrada mascarada de intervalo de datas.
  - `PaginatedTable` – tabela com paginação padronizada (setas Chevron + indicadores).
  - Layouts (ex.: `DashboardLayout`) – wrappers de página.
  - Modais genéricos (ex.: `ConfirmModal`), filtros (ex.: `SalesFilterPanel`).

- **Acessibilidade**
  - Radix onde aplicável; sempre `aria-label` em botões de ícone.
  - Navegação por teclado preservada (foco visível, tab order).
