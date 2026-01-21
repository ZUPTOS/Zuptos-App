# Public App

Contexto específico do app Next.js que vive na raiz do repo.

- **Scripts úteis** (executar na raiz):
  - `pnpm dev` – sobe `next dev`
  - `pnpm build` / `pnpm start` – build e servidor de produção
  - `pnpm lint` / `pnpm check` / `pnpm test` – lint, type-check e testes
- **Env**: crie `.env.local` na raiz; Next lê para este app.
- **Aliases**: `@/` aponta para `src`.
- **Tema/estilo**: Tailwind + Radix; tokens chave (`bg-card`, `text-foreground`, gradiente primário `from-[#6C27D7] to-[#421E8B]`).
- **Padrões**: cantos máx. 7px em inputs/botões/checkboxes; botões primários em modais usam o gradiente.
- **Estrutura**: veja READMEs em `src/components`, `src/views`, `src/data`, `src/lib` para detalhes.
