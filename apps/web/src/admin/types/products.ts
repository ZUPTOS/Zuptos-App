export type AdminProductStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "active"
  | "inactive"
  | "processing"
  | "updating"
  | string;

export interface AdminProduct {
  id: string;
  name?: string;
  type?: string;
  category?: string;
  status?: AdminProductStatus;
  user?: {
    id?: string;
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
  producer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  support_email?: string;
  support_phone?: string;
  supportEmail?: string;
  supportPhone?: string;
  created_at?: string;
  createdAt?: string;
  description?: string;
  sale_url?: string;
  saleUrl?: string;
}

export interface AdminProductSummary {
  total?: number;
  total_revenue?: number;
  totalRevenue?: number;
  user_id?: unknown;
}

export interface AdminProductListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export type AdminProductListResponse =
  | AdminProduct[]
  | {
      data?: AdminProduct[];
      products?: AdminProduct[];
      results?: AdminProduct[];
      total?: number;
    };
