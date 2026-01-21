import React from "react";
import Image from "next/image";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, type TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { cardSurface, paymentIconMap, PAYMENT_LINE_COLOR } from "../constants";
import { useTheme } from "@/contexts/ThemeContext";

interface PaymentDataPoint {
  time: string;
  value: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  percentage: number;
  data: PaymentDataPoint[];
}

interface PaymentMethodsGridProps extends React.HTMLAttributes<HTMLDivElement> {
  paymentMethods?: PaymentMethod[];
  hideValues: boolean;
}

type PaymentChartTooltipProps = TooltipProps<ValueType, NameType> & {
  hideValues: boolean;
};

const PaymentChartTooltip = ({ active, payload, label, hideValues }: PaymentChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  const rawValue = payload[0]?.value;
  const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0);
  return (
    <div className="rounded-[8px] border border-border bg-card px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <div className="flex items-center gap-2">
         <span className="w-2 h-2 rounded-full bg-primary" />
         <span className="text-muted-foreground font-medium">
            {hideValues ? "•••" : numericValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
         </span>
      </div>
    </div>
  );
};

export const PaymentMethodsGrid: React.FC<PaymentMethodsGridProps> = ({ paymentMethods, hideValues, className, style, ...props }) => {
    const { theme } = useTheme();
    const isLightMode = theme === "light";

    const getPaymentIcon = (id: string) => {
        const iconSrc = paymentIconMap[id];
        if (!iconSrc) return null;
        return (
          <Image
            src={iconSrc}
            alt={`${id} icon`}
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
            style={isLightMode ? { filter: "brightness(0)" } : undefined}
          />
        );
      };

    return (
        <div 
          style={{ gridArea: "pagamentos", ...style }} 
          className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-3 ${className || ""}`} 
          {...props}
        >
            {paymentMethods?.slice(0, 3).map((method) => (
                <div key={method.id} className={`${cardSurface} flex h-full flex-col p-3 sm:p-4 md:p-5 lg:p-6`}>
                    <div className="mb-4 text-muted-foreground/70 [&>svg]:w-6 [&>svg]:h-3 md:[&>svg]:w-8 md:[&>svg]:h-4">
                            {getPaymentIcon(method.id)}
                    </div>
                    <p className="text-[clamp(12px,1.3vw,16px)] font-bold text-foreground leading-tight mb-1">{method.name}</p>

                    <div className="mb-2">
                            <span className="text-[clamp(16px,1.6vw,20px)] font-bold text-foreground">{hideValues ? "•••" : `${method.percentage}%`}</span>
                    </div>

                    <div className="w-full h-[50px] sm:h-[55px] md:h-[60px] mb-5 mt-auto relative -bottom-2 translate-y-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hideValues ? method.data.map(d => ({ ...d, value: 0 })) : method.data}>
                                <defs>
                                    <linearGradient id={`gradient-${method.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={PAYMENT_LINE_COLOR} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={PAYMENT_LINE_COLOR} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <Tooltip 
                                    content={<PaymentChartTooltip hideValues={hideValues} />} 
                                    cursor={{ stroke: PAYMENT_LINE_COLOR, strokeWidth: 1, strokeDasharray: "3 3" }} 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={PAYMENT_LINE_COLOR} 
                                    fill={`url(#gradient-${method.id})`} 
                                    strokeWidth={2} 
                                    isAnimationActive={true} 
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ))}
        </div>
    );
};
