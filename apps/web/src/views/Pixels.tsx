'use client';

import DashboardLayout from "@/components/DashboardLayout";

export default function PixelsView() {
  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Pixels de rastreamento">
      <div className="px-4 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <div className="rounded-[12px] border border-foreground/10 bg-card/80 p-6 shadow-[0_14px_36px_rgba(0,0,0,0.35)]">
            <h1 className="text-xl font-semibold text-foreground">Pixels de rastreamento</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure e visualize os pixels associados aos seus produtos. Selecione um produto em
              &quot;Editar produto&quot; para gerenciar pixels específicos.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
