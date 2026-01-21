# Rotas e Navegação

O projeto utiliza o **App Router** do Next.js, onde a estrutura de pastas em `src/app` define as rotas acessíveis.

## Mapa de Rotas

### Pública / Autenticação
*   `/` - Página inicial (Login/Landing).
*   `/nova-senha` - Redefinição de senha.
*   `/recuperar-senha` - Solicitação de recuperação de conta.
*   `/indique` - Página de indicação (pública ou logada, dependendo do contexto).

### Área Logada (Dashboard - Produtor)
Todas as rotas abaixo compartilham o `DashboardLayout` (Sidebar + Header).
*   `/dashboard` - Visão geral, métricas e gráficos.
*   `/vendas` - Listagem e detalhes de vendas.
*   `/produtos` - Gerenciamento de produtos.
*   `/editar-produto/[id]/*` - Editor de produto (multipasos: entregáveis, ofertas, checkout).
*   `/financas` - Saldo, histórico de saques e extrato.
*   `/kyc` - Cadastro de documentos e validação de identidade.
*   `/integracoes` - Webhooks e conexões externas.
*   `/pixels` - Gerenciamento de pixels de rastreamento.
*   `/minha-conta` - Dados pessoais e configurações do perfil.

### Área Administrativa (`/admin`)
Rotas protegidas, acessíveis apenas por usuários com flag `isAdmin`.
*   `/admin/dashboard` - Visão macro do sistema.
*   `/admin/usuarios` - Gestão de usuários da plataforma.
*   `/admin/financas` - Aprovação de saques e auditoria financeira.
*   `/admin/produtos` - Moderação de produtos.
*   `/admin/documentos` - Aprovação de KYC.
*   `/admin/configuracoes` - Configurações globais do sistema.

### Checkout (`/checkout`)
*   `/checkout/[code]` - Renderiza o checkout público para compra de produtos. Isolado do layout do dashboard para maximizar conversão.

## Estrutura de Arquivos (`src/app`)
*   `layout.tsx`: Layout raiz (fontes, providers globais).
*   `page.tsx`: O conteúdo da rota.
*   `loading.tsx`: Estado de carregamento automático (Suspense).
*   `not-found.tsx`: Página 404 customizada.
