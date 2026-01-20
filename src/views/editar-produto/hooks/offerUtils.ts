'use client';

export const formatBRLInput = (value: string) => {
  const numeric = value.replace(/\D/g, "");
  if (!numeric) return "";
  const amount = Number(numeric) / 100;
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const parseBRLToNumber = (value?: string) => {
  if (!value) return undefined;
  const numeric = value.replace(/\D/g, "");
  if (!numeric) return undefined;
  return Number(numeric) / 100;
};
