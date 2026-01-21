# Arquitetura do Projeto Zuptos

## Visão Geral
O Zuptos é uma aplicação web moderna construída sobre **Next.js 15** (App Router), utilizando **React 18** e **TypeScript**. A arquitetura foi desenhada para ser modular, escalável e de fácil manutenção, seguindo o padrão "Feature-First".

## Decisões Arquiteturais e Motivações

### 1. Estrutura Unificada (Single Root)
**Decisão:** O projeto reside puramente na raiz, sem monorepos complexos (antiga pasta `packages/` foi removida).
**Motivo:** Simplificação do build e deploy (Vercel nativo), redução de configuração de ferramentas (tooling overhead) e centralização de dependências. Ideal para o estágio atual do startup onde velocidade de iteração é crucial.

### 2. Feature-First Organization (`src/modules`)
**Decisão:** Funcionalidades ricas (como `admin`, `auth`) são agrupadas em `src/modules`.
**Motivo:** Co-locação. Tudo relacionado a uma feature (views, hooks, tipos específicos) fica próximo, facilitando a navegação e evitando "massas de arquivos" em pastas genéricas.

### 3. Shared Kernel (`src/shared`)
**Decisão:** Componentes visuais (`ui`), hooks globais e utilitários residem em `src/shared`.
**Motivo:** Evita duplicação. `ui` contém componentes "burros" (shadcn/radix) que garantem consistência visual em todo o app.

### 4. Next.js App Router (`src/app`)
**Decisão:** Uso do sistema de rotas baseadas em arquivos do Next.js 15.
**Motivo:** Suporte nativo a React Server Components (RSC) para melhor performance inicial, layouts aninhados (`layout.tsx`) para persistência de UI (sidebar/header) e otimização de SEO automática.

## Fluxo de Dados
A aplicação segue um fluxo unidirecional:
1.  **UI Components** (`src/views`) disparam ações.
2.  **Service Layers** (`src/lib/services`) encapsulam a lógica de negócio e chamadas API.
3.  **API Wrapper** (`src/lib/request.ts`) normaliza requisições e erros.
4.  **Estado Global**: Gerenciado via React Context (`AuthContext`) para sessão e URL state (`useSearchParams`) para filtros, mantendo a aplicação leve sem Redux/Zustand desnecessários por enquanto.
