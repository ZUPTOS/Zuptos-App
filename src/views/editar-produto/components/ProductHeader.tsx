'use client';

import Image from "next/image";
import type { Product } from "@/lib/api";
import { Skeleton } from "@/shared/ui/skeleton";

type Props = {
  product?: Product | null;
  loading?: boolean;
  className?: string;
};

const formatCurrency = (value?: number | string) => {
  const numericValue = Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number.isNaN(numericValue) ? 0 : numericValue);
};

const toNumber = (value?: number | string) => {
  const numericValue = Number(value ?? 0);
  return Number.isNaN(numericValue) ? 0 : numericValue;
};

export function ProductHeader({ product, loading, className }: Props) {
  if (loading) {
    return (
      <div
        className={`flex flex-col gap-4 rounded-[12px] border border-foreground/10 bg-card/80 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:justify-between ${
          className ?? ""
        }`}
      >
        <div className="flex items-center gap-4">
          <Skeleton className="h-[72px] w-[72px] rounded-[10px]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="ml-auto h-4 w-28" />
          <Skeleton className="ml-auto h-3 w-20" />
        </div>
      </div>
    );
  }

  const thumb = product?.image_url || "/images/produto.png";
  const name = product?.name ?? "Produto";
  const rawStatus = (product as Product & { status?: string })?.status ?? "";
  const normalizedStatus = rawStatus.trim().toLowerCase();
  const displayStatus =
    normalizedStatus === "inactive" || normalizedStatus === "inativo"
      ? "Inativo"
      : normalizedStatus === "active" || normalizedStatus === "ativo"
        ? "Ativo"
        : rawStatus.trim() || "Ativo";
  const statusClass =
    normalizedStatus === "inactive" || normalizedStatus === "inativo"
      ? "text-muted-foreground"
      : "text-emerald-400";
  const totalInvoicedValue =
    product?.total_invoiced ??
    (product as Product & { totalInvoiced?: number | string })?.totalInvoiced ??
    0;
  const totalSoldValue =
    product?.total_sold ??
    (product as Product & { totalSold?: number | string })?.totalSold ??
    0;

  return (
    <div
      className={`flex flex-col gap-3 rounded-[10px] border border-foreground/10 bg-card/80 p-4 shadow-[0_14px_36px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:justify-between ${
        className ?? ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="overflow-hidden rounded-[10px] bg-foreground/10">
          <Image
            src={thumb}
            alt={name}
            width={72}
            height={72}
            className="h-[72px] w-[72px] object-cover"
          />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">{name}</p>
          <span className={`text-xs font-semibold ${statusClass}`}>{displayStatus}</span>
        </div>
      </div>
      <div className="text-right text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">
          {formatCurrency(totalInvoicedValue)} faturados
        </p>
        <p>{toNumber(totalSoldValue)} vendas realizadas</p>
      </div>
    </div>
  );
}
