"use client";

import { useRouter } from "next/navigation";
import type { MembersArea } from "../../types/members.types";

type MembersCardProps = {
  area: MembersArea;
};

export default function MembersCard({ area }: MembersCardProps) {
  const router = useRouter();

  const handleCopy = async () => {
    if (typeof navigator === "undefined") return;
    try {
      await navigator.clipboard?.writeText(area.url);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleOpenProducts = () => {
    router.push(`/members/${encodeURIComponent(area.id)}`);
  };

  const studentsLabel = String(area.studentsCount).padStart(2, "0");

  return (
    <article
      className="flex cursor-pointer flex-col overflow-hidden rounded-[4px] border border-border bg-card transition hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      role="button"
      tabIndex={0}
      onClick={handleOpenProducts}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenProducts();
        }
      }}
    >
      <div className="h-[140px] bg-muted/70" aria-hidden="true" />
      <div className="flex flex-col gap-2.5 p-3.5">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">
            {area.name}
          </h3>
          <p className="mt-1.5 text-[12px] text-muted-foreground">
            {studentsLabel} alunos
          </p>
        </div>
        <div className="flex items-center justify-between gap-2.5 border-t border-border pt-2.5">
          <span className="text-[11px] text-muted-foreground">{area.url}</span>
          <button
            type="button"
            className="inline-flex h-7 w-8 items-center justify-center rounded-[4px] border border-border bg-background transition hover:bg-muted/40"
            onClick={(event) => {
              event.stopPropagation();
              void handleCopy();
            }}
            aria-label="Copiar URL"
          >
            <span
              className="h-3 w-3 rounded-sm bg-muted-foreground/60"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </article>
  );
}
