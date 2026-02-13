"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  MEMBERS_AREA_GROUP_LABEL,
  isMembersAreaTab,
  membersAreaTabs,
  productEditTabs,
  type ProductMemberEditTab,
} from "../constants";

type Props = {
  activeTab: ProductMemberEditTab;
  onTabChange: (tab: ProductMemberEditTab) => void;
};

export function ProductMemberEditSidebar({ activeTab, onTabChange }: Props) {
  const [membersOpen, setMembersOpen] = useState(true);

  const isMembersActive = useMemo(() => isMembersAreaTab(activeTab), [activeTab]);

  useEffect(() => {
    if (isMembersActive) setMembersOpen(true);
  }, [isMembersActive]);

  return (
    <nav className="w-56 shrink-0">
      <div
        className={cn(
          "rounded-[10px] border bg-card/60 p-2",
          isMembersActive ? "border-primary/40" : "border-foreground/10"
        )}
      >
        <button
          type="button"
          aria-expanded={membersOpen}
          onClick={() => setMembersOpen((prev) => !prev)}
          className={cn(
            "flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-sm font-semibold transition",
            isMembersActive
              ? "bg-primary/10 text-foreground"
              : "text-muted-foreground hover:bg-muted/20 hover:text-foreground"
          )}
        >
          <span>{MEMBERS_AREA_GROUP_LABEL}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "h-4 w-4 transition-transform",
              membersOpen ? "rotate-180" : "rotate-0"
            )}
          />
        </button>

        {membersOpen && (
          <div className="mt-2 space-y-1 pb-1">
            {membersAreaTabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onTabChange(tab)}
                  className={cn(
                    "w-full rounded-[8px] px-3 py-2 text-left text-sm transition",
                    isActive
                      ? "border border-primary/30 bg-primary/5 text-foreground shadow-[0_0_12px_rgba(95,23,255,0.18)]"
                      : "text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {productEditTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <li key={tab}>
              <button
                type="button"
                onClick={() => onTabChange(tab)}
                className={cn(
                  "w-full rounded-[8px] px-3 py-2 text-left transition",
                  isActive
                    ? "border border-primary/30 bg-primary/5 text-foreground shadow-[0_0_12px_rgba(95,23,255,0.18)]"
                    : "text-muted-foreground hover:text-foreground hover:border hover:border-primary/10"
                )}
              >
                {tab}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

