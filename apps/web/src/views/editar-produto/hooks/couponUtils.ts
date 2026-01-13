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

export const formatPercentInput = (value: string) => {
  const cleaned = value.replace(/[^0-9,]/g, "");
  if (!cleaned) return "";
  const [intPart, decPart] = cleaned.split(",");
  const trimmedDec = decPart ? decPart.slice(0, 2) : "";
  return `${intPart}${trimmedDec ? `,${trimmedDec}` : ""}%`;
};

export const parsePercentToNumber = (value?: string) => {
  if (!value) return undefined;
  const cleaned = value.replace(/[^0-9,]/g, "");
  if (!cleaned) return undefined;
  return Number(cleaned.replace(",", "."));
};
