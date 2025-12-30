'use client';

import { cn } from "@/lib/utils";

type ToggleActiveProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

export default function ToggleActive({
  checked,
  onCheckedChange,
  disabled,
  className,
  id,
  "aria-label": ariaLabel,
}: ToggleActiveProps) {
  return (
    <button
      type="button"
      id={id}
      aria-label={ariaLabel}
      aria-pressed={checked}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-12 items-center rounded-full transition-colors",
        checked ? "bg-primary/70" : "bg-muted",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className
      )}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        className={cn(
          "absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
