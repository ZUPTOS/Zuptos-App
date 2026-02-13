export const MEMBERS_AREA_GROUP_LABEL = "Área de membros";

export const membersAreaTabs = ["Módulos", "Turmas", "Alunos", "Comentários"] as const;
export type MembersAreaTab = (typeof membersAreaTabs)[number];

export const productEditTabs = [
  "Ofertas",
  "Checkouts",
  "Configurações",
  "Pixels de rastreamento",
  "Upsell, downsell e mais",
  "Cupons",
  "Afiliação",
  "Coprodução",
] as const;
export type ProductEditTab = (typeof productEditTabs)[number];

export type ProductMemberEditTab = MembersAreaTab | ProductEditTab;

export const isMembersAreaTab = (tab: ProductMemberEditTab): tab is MembersAreaTab =>
  (membersAreaTabs as readonly string[]).includes(tab);
