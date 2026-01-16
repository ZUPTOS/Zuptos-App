'use client';

import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

type NotificationVariant = "success" | "error" | "warning";

type NotificationToastProps = Readonly<{
  title: string;
  description?: string;
  variant?: NotificationVariant;
}>;

const variantStyles: Record<
  NotificationVariant,
  {
    icon: typeof CheckCircle2;
    wrapper: string;
    iconColor: string;
    accent: string;
    title: string;
    description: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    wrapper: "border-emerald-500/30 bg-emerald-500/10",
    iconColor: "text-emerald-400",
    accent: "bg-emerald-500/15",
    title: "text-emerald-50",
    description: "text-emerald-50/80",
  },
  error: {
    icon: XCircle,
    wrapper: "border-rose-500/30 bg-rose-500/10",
    iconColor: "text-rose-400",
    accent: "bg-rose-500/15",
    title: "text-rose-50",
    description: "text-rose-50/80",
  },
  warning: {
    icon: AlertTriangle,
    wrapper: "border-amber-500/30 bg-amber-500/10",
    iconColor: "text-amber-400",
    accent: "bg-amber-500/15",
    title: "text-amber-50",
    description: "text-amber-50/80",
  },
};

const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test";

export function NotificationToast({ title, description, variant = "success" }: NotificationToastProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "flex w-full max-w-[360px] items-start gap-3 rounded-[10px] border px-4 py-3 shadow-lg shadow-black/20 backdrop-blur",
        styles.wrapper,
      )}
    >
      <span className={cn("mt-0.5 rounded-full p-1.5", styles.accent)}>
        <Icon className={cn("h-5 w-5", styles.iconColor)} aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className={cn("text-sm font-semibold leading-tight", styles.title)}>{title}</p>
        {description ? (
          <p className={cn("text-sm leading-snug", styles.description)}>{description}</p>
        ) : null}
      </div>
    </div>
  );
}

type ShowToastProps = NotificationToastProps;

function showToast({ variant = "success", ...props }: ShowToastProps) {
  if (isTestEnv) return;

  toast.custom(
    () => <NotificationToast {...props} variant={variant} />,
    {
      duration: variant === "error" ? 6000 : 4000,
      position: "bottom-right",
    }
  );
}

export const notify = {
  success: (title: string, description?: string) =>
    showToast({ title, description, variant: "success" }),
  error: (title: string, description?: string) =>
    showToast({ title, description, variant: "error" }),
  warning: (title: string, description?: string) =>
    showToast({ title, description, variant: "warning" }),
};

export type { NotificationVariant };
