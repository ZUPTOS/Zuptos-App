# Consumo de API e Dados

Esta documentação explica como o frontend se comunica com o backend, os padrões adotados e o porquê dessas escolhas.

## Camada de Requisição (`src/lib/request.ts`)

O projeto não usa `axios` diretamente nos componentes. Em vez disso, utiliza um wrapper customizado sobre o **Fetch API** nativo.

### Por que um wrapper (`request`) e não Axios?
1.  **Tamanho do Bundle:** O `fetch` é nativo do browser e Node.js. Evitamos adicionar kb desnecessários ao bundle final.
2.  **Controle Total:** Nosso wrapper (`request.ts`) lida automaticamente com:
    *   **Mixed Content:** Detecta se está em HTTPS chamando HTTP e força proxy `/v1` se necessário.
    *   **Auth Headers:** Injeta tokens automaticamente se necessário (embora a lógica principal esteja nos serviços).
    *   **Error Dispatching:** Dispara evento `zuptos:unauthorized` (logout forçado) em erros 401 globalmente.
    *   **Prefixos:** Remove `/api` legado e normaliza para `/v1`.

## Camada de Serviços (`src/lib/services/*`)

Nunca chamamos `request()` diretamente nas Views. Usamos "Services".

**Padrão:** `src/lib/services/[dominio].ts`
**Exemplo:** `products.ts`, `auth.ts`, `finances.ts`.

```typescript
// Exemplo de Service Method
export const productApi = {
  listProducts: async (params, token) => {
    // Tipagem forte na entrada e saída
    return request<Product[]>("/products", { ... });
  }
}
```

**Motivo:**
*   **Reusabilidade:** O mesmo método pode ser usado em várias páginas.
*   **Abstração:** Se a URL da API mudar de `/products` para `/v1/items`, alteramos em UM lugar só.
*   **Tipagem Centralizada:** As interfaces de retorno estão definidas junto com a chamada.

## Tipagem (`src/lib/api-types.ts`)
Todas as interfaces de DTO (Data Transfer Objects) — Requests e Responses — ficam centralizadas aqui.
**Motivo:** Evita importações circulares e garante que o backend e frontend falem a mesma língua (contratos). Quando um tipo muda, o TypeScript avisa todos os arquivos afetados.

## Padrão de Fetching nas Views
Atualmente, utilizamos `useEffect` assíncrono para chamadas simples:

```tsx
useEffect(() => {
  const load = async () => {
    try {
      const data = await productApi.list(...);
      setState(data);
    } catch (err) {
      setError(err);
    }
  };
  load();
}, [dependencias]);
```

**Nota:** Para o futuro, recomenda-se migrar para **TanStack Query (React Query)** para ganhar cache, deduping e revalidação de foco automática, mas o padrão atual de `useEffect` é suficiente para a escala atual sem adicionar complexidade prematura.
