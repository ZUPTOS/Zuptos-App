# Zuptos – Frontend

Documentação geral do frontend (Next.js) usado nas áreas web da aplicação.

## Índice
- [Visão Geral](#visão-geral)
- [Stack e Ferramentas](#stack-e-ferramentas)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Como Rodar](#como-rodar)
- [Padrões de Código e Estilo](#padrões-de-código-e-estilo)
- [UI / Design System](#ui--design-system)
- [Dados e Integrações](#dados-e-integrações)
- [Testes](#testes)
- [Build e Deploy](#build-e-deploy)
- [Acessibilidade](#acessibilidade)
- [Contribuição](#contribuição)

## Visão Geral
- App Next.js unico na raiz do repo (venda/admin).
- UI baseada em Tailwind, Radix UI e ícones Lucide.
- Estrutura simples com scripts e lockfile na raiz.

## Stack e Ferramentas
- **Framework**: Next.js 15 + React 18.
- **Linguagem**: TypeScript.
- **Estilo**: TailwindCSS, tw-animate-css, class-variance-authority, tailwind-merge.
- **Componentes**: Radix UI (diversos pacotes), cmdk, lucide-react.
- **Estado/Formulários**: React Hook Form; contextos locais.
- **Data/Charts**: date-fns, recharts.
- **Temas**: next-themes.
- **Teste**: Jest + Testing Library.
- **Lint/Format**: ESLint (config Next) e Prettier.

## Estrutura de Pastas
- `src/app` – App Router (rotas e layouts).
- `src/modules` – Funcionalidades agrupadas por dominio (Auth, Admin, etc).
- `src/shared` – Componentes UI, hooks e utilitarios globais.
- `src/lib` – Configuracoes de API e servicos.
- `docs/` – [Documentacao detalhada da arquitetura e decisoes](./docs/ARCHITECTURE.md).
- `public/` – Assets estaticos do Next.js (imagens, icons, etc).

## Como Rodar
Requisitos: Node 18+ (pnpm configurado no projeto).

```bash
pnpm install            # instala dependencias
pnpm dev                # modo desenvolvimento (http://localhost:3000)
pnpm build              # build do app
pnpm start              # servidor de producao
pnpm lint               # ESLint
pnpm check              # checagem TypeScript
pnpm test               # Jest + Testing Library
```

Variaveis de ambiente:
- `.env.local` (ou `.env`) na raiz do projeto.

## Padrões de Código e Estilo
- TypeScript estrito (ver `tsconfig.json`); prefira tipos explicitos em props.
- ESLint + Prettier: rode `pnpm lint` e `pnpm format` antes de commits.
- Nomenclatura: componentes em PascalCase, hooks em `useX`, utilitários em `camelCase`.
- Imports absolutos com `@/` (ex.: `@/components/...`, `@/views/...`).
- Comentários apenas quando agregam contexto.

## UI / Design System
- Tailwind como base; tokens principais:
  - `bg-card`, `text-foreground`, `text-muted-foreground`, `border-foreground/10` etc.
  - Gradiente primário: `from-[#6C27D7] to-[#421E8B]` em botões de confirmação/ações chave.
- Componentes base:
  - Botões: cantos ≤ 7px; usar gradiente em ações primárias dentro de modais.
  - Inputs/Checkboxes: cantos ≤ 7px; checkboxes customizados com marca ✓.
  - Tabelas: paginação padronizada com setas (Chevron) e indicadores `1 2 3 ... last`.
  - Cards: `rounded-[7px]` ou `rounded-[12px]` conforme contexto; usar `bg-card`.
- Responsividade: layouts otimizados para desktop; ajustar em `xl`/`2xl` quando houver recomendações específicas.

## Dados e Integrações
- Mocks em `src/data/*` para listas (produtos, usuários, documentos etc.).
- Utilitários de paginação em `src/lib/pagination.ts`.
- Consumo de dados reais deve seguir os contratos de domínio (ex.: status, datas, valores formatados pt-BR).
- Formatação de valores: moeda BR (`formatCurrency`), datas `dd/MM/yyyy` (ou máscaras específicas nos filtros).

## Testes
- Rodar `pnpm test` para unidade/integração (Jest + @testing-library/react).
- Cobertura configurada via `--coverage`; ambiente JSDOM.
- Adicione testes para novos componentes/páginas quando possível, cobrindo:
  - Render básico
  - Estados de loading/erro/empty
  - Interações de formulário/filtros

## Build e Deploy
- `pnpm build` executa o build do app.
- Saida de producao via `pnpm start`.
- CI recomendada: passos `pnpm install`, `pnpm build`, e checks quando necessario.

## Acessibilidade
- Use componentes Radix sempre que possível (foco/aria nativos).
- Inputs com `label` associado; botões com `aria-label` quando forem ícones.
- Navegação por teclado: garantir `tabIndex` correto em elementos customizados (checkboxes, selects).

## Contribuição
- Crie branch por feature/bugfix.
- Antes de abrir PR: `pnpm lint`, `pnpm check`, `pnpm test`.
- Mantenha descrições curtas e referências às issues/tarefas.

---
Em caso de duvidas rapidas: ver `src/components` e `src/views` para exemplos de padroes adotados.
