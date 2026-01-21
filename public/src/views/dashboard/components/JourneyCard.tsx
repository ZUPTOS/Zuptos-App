import React from "react";
import { cardSurface } from "../constants";
import { Check, Lock } from "lucide-react";

interface Level {
  id: string;
  name: string;
  threshold: number;
  unlocked: boolean;
}

interface JourneyData {
  user?: {
      progress?: number;
      levelName?: string;
      level?: string;
      nextLevel?: string;
  };
  levels?: Level[];
}

interface JourneyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  journeyData?: JourneyData;
  hideValues: boolean;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({ journeyData, hideValues, className, style, ...props }) => {
     const defaultStyle = { gridArea: "jornada", ...style };

     // Logic to find levels
     const levels = journeyData?.levels || [];
     const unlockedLevels = levels.filter(l => l.unlocked);
     const currentLevelId = journeyData?.user?.level;
     const currentLevelObj = levels.find(level => level.id === currentLevelId) || unlockedLevels[unlockedLevels.length - 1] || null;
     const nextLevelObj = levels.find(l => !l.unlocked);
     const progressWidth = hideValues ? 0 : (journeyData?.user?.progress ?? 0);

     return (
        <div style={defaultStyle} className={`${cardSurface} flex h-full flex-col p-3 sm:p-4 md:p-5 lg:p-6 xl:p-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5 ${className || ""}`} {...props}>
             <div className="flex flex-col gap-1">
                 <div className="flex items-center justify-between">
                     <p className="text-[clamp(12px,1.5vw,16px)] font-bold text-foreground">Sua jornada ZUPTOS</p>
                 </div>
                 <div className="flex items-center justify-between text-[clamp(10px,1.2vw,14px)]">
                     <span className="text-muted-foreground">Você é <span className="font-bold text-foreground capitalize">{hideValues ? "•••" : (journeyData?.user?.levelName || currentLevelObj?.name)}</span></span>
                     {nextLevelObj && (
                         <span className="text-muted-foreground">Próximo nível é <span className="font-bold text-foreground capitalize">{hideValues ? "•••" : nextLevelObj.name}</span></span>
                     )}
                 </div>
             </div>

             {/* Progress Bar */}
             <div className="relative h-2 sm:h-2.5 md:h-3 w-full bg-muted rounded-full overflow-hidden">
                 <div 
                     className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-1000 ease-out"
                     style={{ width: `${progressWidth}%` }}
                 />
             </div>

             {/* Level Cards */}
             <div className="flex justify-center gap-[3px] mt-4">
                 {levels.slice(0, 3).map((level) => {
                     const isUnlocked = level.unlocked;
                     const isCurrent = level.id === currentLevelObj?.id;
                     const iconColor = isUnlocked ? "bg-primary" : "bg-muted";
                     const cardClassName = isCurrent
                       ? "bg-card border-primary shadow-[0_0_24px_rgba(108,39,215,0.3)]"
                       : isUnlocked
                         ? "bg-card border-primary/60"
                         : "bg-muted/5 border-transparent opacity-80";

                     return (
                         <div 
                             key={level.id} 
                             className={`relative flex flex-1 w-full flex-col items-center justify-center gap-1 sm:gap-1.5 md:gap-2 p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-[12px] border transition-all duration-300 group
                                 ${cardClassName}
                             `}
                         >
                             {/* Glow effect for active/unlocked */}
                             {isUnlocked && <div className="absolute inset-0 bg-primary/5 opacity-50" />}
                             
                             <div className={`w-[50%] h-[clamp(52px,7vw,100px)] rounded-[8px] ${iconColor} z-10 transition-transform group-hover:scale-105`} />
                             
                             <div className="text-center z-10 flex flex-col gap-0.5">
                                 <p className={`text-[clamp(10px,1.5vw,16px)] font-bold ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>{hideValues ? "•••" : `${(level.threshold / 1000)}k`}</p>
                                 <p className="text-[clamp(8px,1vw,10px)] uppercase font-bold text-muted-foreground tracking-wide">{level.name}</p>
                             </div>

                             <div className={`absolute top-2 right-2 z-20 ${isUnlocked ? "text-primary" : "text-muted-foreground"}`}>
                                 {isUnlocked ? <Check size={14} strokeWidth={3} /> : <Lock size={14} />}
                             </div>
                         </div>
                     )
                 })}
             </div>
        </div>
     );
};
