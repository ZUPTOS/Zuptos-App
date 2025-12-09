# Data (mocks)

Mocks locais usados nas views enquanto APIs reais não estão integradas.

- **Arquivos**
  - `admin-produtos.json`, `admin-usuarios.json`, `admin-documentos.json`, etc.
  - Estruturas simples (arrays de objetos) consumidas diretamente nas views.

- **Uso**
  - Importe via `import products from '@/data/admin-produtos.json';`.
  - Tipagem: declare tipos locais na view e aplique `as Type[]` se necessário.

- **Boas práticas**
  - Mantenha campos consistentes com o contrato esperado do backend (status, datas, valores formatados).
  - Para novos mocks, siga o padrão de chave `id` única e strings já formatadas para exibição.
