"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react";
import MembersCard from "../components/MembersCard/MembersCard";
import MembersPagination from "../components/MembersPagination/MembersPagination";
import { listMembersAreas } from "../requests/members.api";
import type {
  MembersArea,
  PaginationMeta,
} from "../types/members.types";

const initialMeta: PaginationMeta = {
  page: 1,
  perPage: 6,
  totalItems: 0,
  totalPages: 1,
};

export default function MembersCollectionPage() {
  const { user } = useAuth();
  const [membersAreas, setMembersAreas] = useState<MembersArea[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");

  const userName = useMemo(
    () => user?.fullName || user?.username || "Zuptos",
    [user]
  );

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    const delay = 300 + Math.floor(Math.random() * 300);
    const timer = window.setTimeout(async () => {
      const response = await listMembersAreas(currentPage, searchValue);
      if (!isActive) return;
      setMembersAreas(response.data);
      setMeta(response.meta);
      setIsLoading(false);
    }, delay);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [currentPage, searchValue]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    if (page < 1 || page > meta.totalPages) return;
    setCurrentPage(page);
  };

  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      setNewAreaName("");
    }
  };

  const hasResults = membersAreas.length > 0;

  return (
    <DashboardLayout
      userName={userName}
      userLocation="RJ"
      pageTitle="Área de membros"
    >
      <section className="min-h-full bg-background px-5 py-6 pb-9 text-foreground sm:px-8">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-[320px]">
              <span
                className="absolute left-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-sm bg-muted-foreground/60"
                aria-hidden="true"
              />
              <input
                className="h-10 w-full rounded-[4px] border border-border bg-card px-4 pl-10 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                type="search"
                placeholder="Buscar"
                aria-label="Buscar áreas de membros"
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>
            <button
              className="h-10 w-full rounded-[4px] bg-primary px-5 text-[13px] font-semibold text-primary-foreground transition hover:brightness-105 sm:w-auto"
              type="button"
              onClick={() => setIsCreateOpen(true)}
            >
              Criar área de membros
            </button>
          </div>

          <h2 className="mb-4 mt-6 text-lg font-semibold">Áreas de membros</h2>

          {isLoading ? (
            <div className="rounded-[4px] border border-dashed border-border p-8 text-[13px] text-muted-foreground">
              Carregando áreas de membros...
            </div>
          ) : hasResults ? (
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {membersAreas.map((area) => (
                <MembersCard key={area.id} area={area} />
              ))}
            </div>
          ) : (
            <div className="rounded-[4px] border border-dashed border-border p-8 text-[13px] text-muted-foreground">
              Nenhuma área encontrada.
            </div>
          )}

          <MembersPagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </section>

      <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-[520px] rounded-[4px] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-8"
          showCloseButton={false}
        >
          <div className="flex items-start justify-between gap-6">
            <DialogTitle className="text-2xl font-semibold text-white sm:text-3xl">
              Criar área de membros
            </DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-[4px] p-2 text-zinc-500 transition hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />

          <div className="mt-5 space-y-3">
            <label className="text-base font-semibold text-white sm:text-lg">
              Nome da área de membros
            </label>
            <input
              type="text"
              value={newAreaName}
              onChange={(event) => setNewAreaName(event.target.value)}
              placeholder="Insira o nome"
              className="w-full rounded-[4px] border border-white/10 bg-[#141414] px-4 py-3 mt-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#6c27d7]/60"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="h-11 rounded-[4px] bg-[#6c27d7] px-6 text-sm font-semibold text-white transition hover:bg-[#5b21b6]"
            >
              Criar área de membros
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
