import withdrawalsData from "@/data/admin-saques.json";

export type Withdrawal = (typeof withdrawalsData.withdrawals)[number];
