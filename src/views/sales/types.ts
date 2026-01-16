export type PaymentMethod = "credit_card" | "pix" | "boleto";

export type SaleStatus = "aprovada" | "recusada" | "expirada";

export interface Sale {
  id: string;
  productName: string;
  productType: string;
  buyerName: string;
  buyerEmail: string;
  saleType: string;
  saleDate: string;
  paymentMethod: PaymentMethod;
  plan: string;
  total: number;
  status: SaleStatus;
  coupon?: string;
  utm?: string;
  orderBumps?: Array<{ title?: string; type?: string; price?: number }>;
}

export interface MetricCard {
  id: string;
  title: string;
  value: number;
  change: number;
  data: { label: string; value: number }[];
}
