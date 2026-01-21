import transactionsData from "@/data/admin-transacoes.json";

export type Transaction = (typeof transactionsData.transactions)[number];
