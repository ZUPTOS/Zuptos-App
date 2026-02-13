import type { MembersProduct } from "@/views/members/types/members.types";

export type ProductRow = {
  id: string;
  items: MembersProduct[];
};

export type ImportableProduct = {
  id: string;
  name: string;
};

export type MembersStudent = {
  id: string;
  name: string;
  email: string;
  lastAccess: string;
  products: Array<{ id: string; name: string }>;
  progressPercent: number;
  completed: boolean;
  active: boolean;
};

