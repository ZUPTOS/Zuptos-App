import type { SVGProps } from "react";

type DetalhamentoIconProps = SVGProps<SVGSVGElement>;

export default function DetalhamentoIcon({ className, ...props }: DetalhamentoIconProps) {
  return (
    <svg
      viewBox="0 0 43 43"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect
        width="42.2595"
        height="42.2595"
        rx="6.229"
        fill="var(--detalhamento-surface, #0b0b0b)"
      />
      <rect
        x="0.244275"
        y="0.244275"
        width="41.771"
        height="41.771"
        rx="5.98473"
        stroke="var(--detalhamento-stroke, rgba(144,144,144,0.18))"
        strokeWidth="0.488549"
      />
      {[10, 18, 26].map(y => (
        <rect
          key={y}
          x="10"
          y={y}
          width="21"
          height="4"
          rx="1.2"
          fill="var(--detalhamento-lines, #aeb0b5)"
        />
      ))}
    </svg>
  );
}
