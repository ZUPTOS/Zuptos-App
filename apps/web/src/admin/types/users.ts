export type AdminUserStatus =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "suspended"
  | "blocked"
  | string;

export interface AdminUser {
  id: string;
  name?: string;
  email?: string;
  document?: string;
  status?: AdminUserStatus;
  total?: string | number;
  tax?: string | number;
  createdAt?: string;
  created_at?: string;
  fullName?: string;
  razaoSocial?: string;
  accountType?: string;
  account_type?: string;
}

export interface AdminUsersSummary {
  total?: number;
  active?: number;
  pending?: number;
  suspended?: number;
  inactive?: number;
}

export interface AdminUsersListParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export type AdminUsersListResponse =
  | AdminUser[]
  | {
      data?: AdminUser[];
      users?: AdminUser[];
      results?: AdminUser[];
      total?: number;
    };
