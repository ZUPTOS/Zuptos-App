"use client";

import { useEffect, useState } from "react";
import { buildLoginRedirectUrl, isAuthed } from "@/lib/auth";
import styles from "@/styles/ui.module.css";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      window.location.href = buildLoginRedirectUrl("/dashboard");
      return;
    }

    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className={styles.bridge}>
        <div className={styles.bridgeCard}>
          <h2>Verificando acesso...</h2>
          <p className={styles.muted}>
            Checando sua sessao da area de membros.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
