export type MembersArea = {
  id: string;
  name: string;
  studentsCount: number;
  url: string;
};

export type PaginationMeta = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export type MembersListResponse = {
  data: MembersArea[];
  meta: PaginationMeta;
};
