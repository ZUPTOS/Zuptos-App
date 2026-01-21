"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth";
import styles from "@/styles/ui.module.css";

export default function BridgeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Security note: accepting token via query/hash is DEV-friendly only.
    // Remove or harden this flow before production releases.
    const queryToken = searchParams.get("token");
    const hashToken =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.hash.replace(/^#/, "")).get("token")
        : null;

    const token = queryToken ?? hashToken;
    if (token) {
      setToken(token);
    }

    const redirectParam = searchParams.get("redirect");
    const safeRedirect = redirectParam?.startsWith("/") ? redirectParam : "/dashboard";
    router.replace(safeRedirect);
  }, [router, searchParams]);

  return (
    <div className={styles.bridgeCard}>
      <h2>Conectando sua sessao</h2>
      <p className={styles.muted}>
        Salvando token e redirecionando para sua area de membros.
      </p>
    </div>
  );
}
