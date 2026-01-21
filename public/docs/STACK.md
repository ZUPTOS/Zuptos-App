# Stack Tecnológico e Bibliotecas

Lista das principais tecnologias usadas no Zuptos, onde são aplicadas e a justificativa de escolha.

## Core
*   **Next.js 15:** Framework React fullstack.
    *   *Uso:* Roteamento, SSR, Otimização de Imagens e Build system.
    *   *Por que:* Padrão de mercado, excelente performance, SEO nativo e facilidade de deploy na Vercel.
*   **React 18:** Biblioteca de UI.
    *   *Uso:* Construção de interfaces declarativas.
    *   *Por que:* Ecossistema vasto, componentização robusta.
*   **TypeScript:** Superset tipado para JS.
    *   *Uso:* Todo o projeto (`.ts`, `.tsx`).
    *   *Por que:* Segurança de código, autocompletar inteligente e redução drástica de bugs em tempo de execução.

## Estilização e UI
*   **Tailwind CSS (v4 alpha/beta via plugin):** Framework Utility-first.
    *   *Uso:* Estilização global e componentes.
    *   *Por que:* Velocidade de desenvolvimento, evita arquivos CSS separados, design system via tokens.
*   **Radix UI:** Componentes "headless" acessíveis.
    *   *Uso:* Modais (Dialog), Tooltips, Checkboxes, Selects, Separators.
    *   *Por que:* Garante acessibilidade (WAI-ARIA) e gerenciamento de foco complexo sem ditar o estilo visual (totalmente customizável com Tailwind).
*   **Lucide React:** Biblioteca de ícones.
    *   *Uso:* Ícones em toda a aplicação.
    *   *Por que:* Leve, SVG nativo, estilo consistente e moderno.

## Estado e Formulários
*   **React Hook Form:** Gerenciamento de formulários.
    *   *Uso:* Formulários de login, cadastro, edição de produto.
    *   *Por que:* Performance (renderiza apenas o input que mudou), validação fácil e menos código boilerplate que o state nativo.
*   **Context API (Nativo):** Estado global.
    *   *Uso:* `AuthContext` (usuário/token).
    *   *Por que:* Suficiente para dados que mudam pouco (sessão). Evita o peso de Redux/Zustand.

## Utilitários
*   **date-fns:** Manipulação de datas.
    *   *Uso:* Formatação de datas em tabelas e gráficos.
    *   *Por que:* Modular (tree-shakable), imutável e muito mais leve que Moment.js.
*   **Recharts:** Gráficos.
    *   *Uso:* Dashboard financeiro e de vendas.
    *   *Por que:* Construído para React, composível e fácil de customizar com SVG.
*   **Sonner:** Toasts (notificações).
    *   *Uso:* Feedback de sucesso/erro (canto inferior direito).
    *   *Por que:* Mais bonito, leve e com melhor UX que os toasts padrão.
