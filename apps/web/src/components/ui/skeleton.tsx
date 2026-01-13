'use client';

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-accent/80",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.6s_linear_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
