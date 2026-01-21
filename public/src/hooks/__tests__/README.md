# Hooks Tests

Hooks customizados (`@/hooks`) devem ser testados com renderHook (Testing Library).

- Mockar providers/contexts necessários ao hook.
- Testar transições de estado e efeitos colaterais observáveis.
- Evitar dependência em timers reais; use `vi.useFakeTimers`/`jest.useFakeTimers` conforme config do projeto.
