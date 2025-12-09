# Views Tests

Testes de telas (`@/views`), focados em fluxo e integração de componentes.

- Use mocks leves para dados (ex.: fixtures simples) e mantenha o layout real sempre que possível.
- Asserts em comportamento do usuário: filtros, navegação, submissão de formulários, paginação.
- Verificar estados (loading/empty/error) e visibilidade de ações condicionais.
- Preferir `user-event` para interações; consultar elementos por rótulos e papéis acessíveis.
