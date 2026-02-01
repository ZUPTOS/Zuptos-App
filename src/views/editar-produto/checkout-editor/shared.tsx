import type { ReactNode } from "react";
import Image from "next/image";

export const fieldClass =
  "h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

type SectionCardProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  iconSrc?: string;
};

export const SectionCard = ({ children, title, subtitle, iconSrc }: SectionCardProps) => (
  <div className="space-y-3 rounded-[12px] border border-foreground/15 bg-card/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {iconSrc && (
          <div className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-foreground/5">
            <Image src={iconSrc} alt={title} width={16} height={16} className="h-4 w-4 object-contain" />
          </div>
        )}
        <p className="text-base font-semibold text-foreground">{title}</p>
      </div>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
    {children}
  </div>
);
