import React from "react";
import { cardSurface } from "../constants";

interface GreetingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  greetingName: string;
}

export const GreetingCard: React.FC<GreetingCardProps> = ({ greetingName, className, style, ...props }) => {
  // Default style includes the gridArea for the main desktop layout, but can be overridden
  const defaultStyle = { gridArea: "saudacao", ...style };
  
  return (
    <div style={defaultStyle} className={`${cardSurface} flex flex-col justify-between p-3 sm:p-4 md:p-5 lg:p-6 xl:p-6 2xl:p-6 ${className || ""}`} {...props}>
        <p className="text-[clamp(10px,1.2vw,14px)] text-muted-foreground">
            Hoje é {new Date().toLocaleDateString("pt-BR", {
            timeZone: "America/Sao_Paulo",
            day: "numeric",
            month: "long",
            year: "numeric"
            })}
        </p>
        <div>
            <h1 className="text-[clamp(18px,2.1vw,24px)] text-foreground font-bold leading-tight truncate">
                Olá, {greetingName}
            </h1>
            <p className="text-[clamp(10px,1.2vw,13px)] text-muted-foreground mt-1.5 leading-snug max-w-[100%]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
        </div>
    </div>
  );
};
