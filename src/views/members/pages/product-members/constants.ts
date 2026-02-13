export const tabs = ["Produtos", "Alunos", "Configurações", "Personalização"] as const;

export type MembersTab = (typeof tabs)[number];

export const SEARCH_DEBOUNCE_MS = 300;
export const MAX_LAYOUT_FILE_BYTES = 2 * 1024 * 1024; // 2MB

