"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";

type Module = {
  id: string;
  name: string;
  description: string;
};

const buildMockModules = (): Module[] => [
  { id: "module-1", name: "Nome do módulo", description: "Descrição do módulo" },
  { id: "module-2", name: "Nome do módulo", description: "Descrição do módulo" },
];

function DotsHandle() {
  return (
    <div
      className="grid h-4 w-4 grid-cols-2 gap-[2px]"
      aria-hidden="true"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <span
          key={index}
          className="h-1 w-1 rounded-[2px] bg-muted-foreground/60"
        />
      ))}
    </div>
  );
}

function ModuleCard({
  module,
  expanded,
  onToggle,
  menuOpen,
  onToggleMenu,
}: {
  module: Module;
  expanded: boolean;
  onToggle: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Abrir módulo ${module.id}`}
      aria-expanded={expanded}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "rounded-[10px] border border-foreground/10 bg-card/70 px-5 py-5",
        "shadow-[0_18px_48px_rgba(0,0,0,0.35)]",
        "cursor-pointer transition hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div
            className="h-[84px] w-[84px] shrink-0 rounded-[10px] border border-foreground/10 bg-muted/40 shadow-inner"
            aria-hidden="true"
          />
          <div>
            <p className="text-lg font-semibold text-foreground">{module.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <p className="text-[11px] font-medium text-muted-foreground">Conteúdos</p>

          <div className="flex flex-wrap items-center gap-4">
            <div
              className="flex items-center gap-2"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Diminuir visualização"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-foreground/10 bg-background/20 text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
              >
                <Minimize2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Aumentar visualização"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-foreground/10 bg-background/20 text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="h-9 w-px bg-foreground/10" aria-hidden="true" />

            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="inline-flex h-9 items-center gap-3 rounded-[8px] border border-foreground/10 bg-background/20 px-4 text-xs font-semibold text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] border border-foreground/10 bg-card/60">
                <Plus className="h-4 w-4" aria-hidden="true" />
              </span>
              Adicionar conteúdo
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-5 border-t border-foreground/10 pt-4">
          <div className="flex flex-wrap items-center gap-3 md:pl-[104px]">
            <Checkbox
              onClick={(event) => event.stopPropagation()}
              aria-label="Selecionar módulo"
            />

            <div
              className="inline-flex flex-wrap items-center gap-2 rounded-[8px] border border-foreground/10 bg-background/20 px-3 py-2"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[6px] px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Mostrar
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[6px] px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
              >
                <EyeOff className="h-4 w-4" aria-hidden="true" />
                Ocultar
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[6px] px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
              >
                <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
                Transferir
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[6px] px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Excluir
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 md:pl-[104px]">
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground/70">
                <DotsHandle />
              </div>
              <Checkbox
                aria-label="Selecionar aula"
                onClick={(event) => event.stopPropagation()}
              />
              <p className="text-sm text-foreground">Aula 1</p>
            </div>

            <div
              className="relative"
              data-members-menu="true"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label={`Abrir menu da aula do ${module.id}`}
                onClick={onToggleMenu}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" aria-hidden="true" />
              </button>

              {menuOpen && (
                <div className="absolute left-[calc(100%+14px)] top-1/2 z-30 min-w-[160px] -translate-y-1/2 rounded-[8px] border border-foreground/10 bg-card p-2 shadow-[0_22px_70px_rgba(0,0,0,0.55)]">
                  <button
                    type="button"
                    className="flex w-full items-center rounded-[8px] px-3 py-2 text-left text-xs text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center rounded-[8px] px-3 py-2 text-left text-xs text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductMemberModulesTab() {
  const [searchValue, setSearchValue] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-members-menu="true"]')) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const modules = useMemo(() => {
    const all = buildMockModules();
    const term = searchValue.trim().toLowerCase();
    if (!term) return all;
    return all.filter((module) => [module.name, module.description].some((value) => value.toLowerCase().includes(term)));
  }, [searchValue]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Módulos</h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative w-full sm:max-w-[260px]">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Buscar..."
              aria-label="Buscar módulos"
              className={cn(
                "h-10 rounded-[8px] border border-foreground/10 bg-card/70 pl-9 text-sm text-foreground shadow-none",
                "placeholder:text-muted-foreground focus-visible:ring-primary/40"
              )}
            />
          </div>

          <button
            type="button"
            className="h-10 rounded-[8px] bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-[0_14px_30px_rgba(95,23,255,0.25)] transition hover:brightness-105"
          >
            Criar módulo
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {modules.map((module, index) => (
          <div key={module.id} className="space-y-3">
            <p className="text-xs text-muted-foreground">{`Módulo ${index + 1} :`}</p>
            <ModuleCard
              module={module}
              expanded={expandedId === module.id}
              onToggle={() => {
                setOpenMenuId(null);
                setExpandedId((current) => (current === module.id ? null : module.id));
              }}
              menuOpen={openMenuId === module.id}
              onToggleMenu={() =>
                setOpenMenuId((current) => (current === module.id ? null : module.id))
              }
            />
          </div>
        ))}
        {modules.length === 0 && (
          <div className="rounded-[10px] border border-dashed border-foreground/10 bg-card/40 px-6 py-10 text-sm text-muted-foreground">
            Nenhum módulo encontrado.
          </div>
        )}
      </div>
    </section>
  );
}
