import React from "react";
import Image from "next/image";
import { cardSurface } from "../constants";

interface BalanceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number;
  iconSrc: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ label, value, iconSrc, className, style, ...props }) => {
  return (
    <div style={style} className={`${cardSurface} flex h-full flex-col justify-center p-3 sm:p-4 md:p-4 lg:p-5 xl:p-5 gap-0.5 sm:gap-1 ${className || ""}`} {...props}>
        <div className="flex items-center gap-2 mb-1.5">
            <Image src={iconSrc} alt="" width={40} height={40} className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10" />
        </div>
        <span className="text-[clamp(10px,1.1vw,12px)] text-muted-foreground font-medium">{label}</span>
        <span className="text-[clamp(14px,1.8vw,20px)] font-bold text-foreground mt-0.5 tracking-tight">
            {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
    </div>
  );
};
