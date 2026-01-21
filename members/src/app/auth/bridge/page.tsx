import { Suspense } from "react";
import BridgeClient from "./BridgeClient";
import styles from "@/styles/ui.module.css";

export default function AuthBridgePage() {
  return (
    <div className={styles.bridge}>
      <Suspense
        fallback={
          <div className={styles.bridgeCard}>
            <h2>Conectando sua sessao</h2>
            <p className={styles.muted}>Preparando redirecionamento...</p>
          </div>
        }
      >
        <BridgeClient />
      </Suspense>
    </div>
  );
}
