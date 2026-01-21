import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "./LoadingScreen.module.css";

type LoadingScreenProps = {
  label?: string;
  fullscreen?: boolean;
};

export default function LoadingScreen({
  label = "Carregando...",
  fullscreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={cn(styles.root, fullscreen && styles.fullscreen)}
      role="status"
      aria-live="polite"
    >
      <div className={styles.brand}>
        <div className={styles.logo}>
          <Image
            src="/images/logoSide.svg"
            alt="Zuptos"
            width={46}
            height={46}
            priority
          />
        </div>
        <span className={styles.wordmark}>zuptos</span>
      </div>

      <div className={styles.barWrapper}>
        <div className={styles.glow} aria-hidden />
        <div className={styles.bar} />
      </div>

      {label ? <p className={styles.caption}>{label}</p> : null}
    </div>
  );
}
