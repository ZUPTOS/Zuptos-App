import React from "react";
import { cardSurface, HEALTH_COLORS } from "../constants";

interface HealthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  healthData?: {
    healthScore?: number;
    healthDetails?: Array<{ label: string; percentage: number }>;
  };
  hideValues: boolean;
}

export const HealthCard: React.FC<HealthCardProps> = ({ healthData, hideValues, className, style, ...props }) => {
  const defaultStyle = { gridArea: "saude", ...style };
  
  const healthLevels = [
    { label: "péssima", color: "#ef4444" },
    { label: "ruim", color: "#f59e0b" },
    { label: "boa", color: "#22c55e" },
    { label: "ótima", color: "#38bdf8" }
  ];

  const rawScore = healthData?.healthScore ?? 0;
  const normalizedScore = rawScore > 10 ? rawScore / 10 : rawScore;
  const activeIndex =
    normalizedScore <= 2.5 ? 0 : normalizedScore <= 5 ? 1 : normalizedScore <= 7.5 ? 2 : 3;
  const activeLabel = healthLevels[activeIndex]?.label ?? "boa";

  // Memoize health segments if needed, but simple mapping is fine here
  const healthSegments = (healthData?.healthDetails ?? [])
        .slice(0, 3)
        .map((detail, idx) => ({
          ...detail,
          color: HEALTH_COLORS[idx % HEALTH_COLORS.length]
        }));

  return (
    <div style={defaultStyle} className={`${cardSurface} flex h-full flex-col gap-2 p-3 sm:p-4 md:p-5 lg:p-6 xl:p-6 2xl:p-7 ${className || ""}`} {...props}>
        <div className="flex gap-1 w-full mt-1 items-end">
            {healthLevels.map((level, index) => {
              const isActive = index === activeIndex;
              return (
                <div 
                    key={level.label} 
                    className={`flex-1 rounded-[2px] ${isActive ? 'h-[11px]' : 'h-[8px]'}`} 
                    style={{ backgroundColor: level.color, opacity: hideValues ? 0.6 : isActive ? 1 : 0.35 }} 
                />
              );
            })}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <span className="text-[clamp(18px,2.4vw,28px)] font-bold text-foreground leading-none tracking-tight">
                {hideValues ? "•••" : (healthData?.healthScore ?? 0)}
            </span>
            <span className="text-[clamp(10px,1.4vw,14px)] text-muted-foreground">
                A saúde da conta está{" "}
                <span className="font-bold text-foreground">{hideValues ? "•••" : activeLabel}</span>
            </span>
        </div>
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
             {healthSegments.map(s => (
                <span key={s.label} className="bg-foreground/5 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-[6px] text-[clamp(9px,1.2vw,11px)] font-medium text-muted-foreground">
                    {s.label} {hideValues ? "•••" : `${s.percentage}%`}
                </span>
             ))}
        </div>
    </div>
  );
};
