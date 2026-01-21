# Public App

Contexto específico do app Next.js que vive em `public/`.

- **Scripts úteis** (executar na raiz):
  - `pnpm dev:public` – sobe `next dev` em `public`
  - `pnpm build:public` / `pnpm start:public` – build e servidor de produção
  - `pnpm -C public lint` / `pnpm -C public check` / `pnpm -C public test` – lint, type-check e testes
- **Env**: crie `public/.env.local`; Next lê para este app.
- **Aliases**: `@/` aponta para `public/src`.
- **Tema/estilo**: Tailwind + Radix; tokens chave (`bg-card`, `text-foreground`, gradiente primário `from-[#6C27D7] to-[#421E8B]`).
- **Padrões**: cantos máx. 7px em inputs/botões/checkboxes; botões primários em modais usam o gradiente.
- **Estrutura**: veja READMEs em `src/components`, `src/views`, `src/data`, `src/lib` para detalhes.
