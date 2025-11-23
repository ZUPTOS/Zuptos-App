'use client';

import { useState } from "react";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const filters = [
  { id: "all", label: "Todos" },
  { id: "connected", label: "Conectados" },
  { id: "disconnected", label: "Desconectados" }
] as const;

type FilterId = (typeof filters)[number]["id"];

export default function Integrations() {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Integrações">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pb-8 pt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map(filter => {
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`inline-flex h-11 min-w-[120px] items-center justify-center rounded-[10px] px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    isActive
                      ? "bg-card text-foreground shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
                      : "bg-card/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="w-full md:w-[320px]">
            <label className="sr-only" htmlFor="integrations-search">
              Buscar integrações
            </label>
            <div className="flex h-11 items-center gap-2 rounded-[10px] border border-muted bg-card px-3 text-sm text-foreground">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
              <input
                id="integrations-search"
                type="search"
                placeholder="Buscar"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                className="h-full w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-[320px] w-full items-center justify-center rounded-[16px] border border-dashed border-muted bg-card/50 text-muted-foreground">
          <p className="text-sm">
            Nenhuma integração disponível no momento.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
