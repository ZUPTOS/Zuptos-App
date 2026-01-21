# View Components Tests

Componentes específicos de views (painéis, modais, filtros).

- Cobrir interações principais (abrir/fechar modais, aplicar filtros, paginação).
- Garantir que props obrigatórias acionem callbacks (ex.: `onClose`, `onChange`).
- Mockar apenas dependências externas (ex.: router, fetch); mantenha o componente o mais real possível.
- Usar queries acessíveis e `user-event` para simular o usuário final.
