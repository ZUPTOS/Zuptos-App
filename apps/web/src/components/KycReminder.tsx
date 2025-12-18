'use client';

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { kycApi } from "@/lib/api";

type KycState = "idle" | "loading" | "incomplete" | "complete" | "error";

export default function KycReminder() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<KycState>("idle");
  const isKycPage = pathname?.startsWith("/kyc");

  useEffect(() => {
    let active = true;

    const checkStatus = async () => {
      if (!isAuthenticated || !token) {
        setStatus("idle");
        return;
      }
      setStatus("loading");
      try {
        const completed = await kycApi.getStatus(token);
        if (!active) return;
        setStatus(completed ? "complete" : "incomplete");
      } catch (_error) {
        if (!active) return;
        setStatus("error");
      }
    };

    void checkStatus();
    return () => {
      active = false;
    };
  }, [isAuthenticated, token]);

  const shouldShow = useMemo(() => {
    if (isKycPage) return false;
    if (!isAuthenticated) return false;
    // Evita piscar enquanto consulta status
    if (status === "idle" || status === "loading") return false;
    if (status === "complete") return false;
    // Mantém aviso em caso de erro ou KYC incompleto
    return true;
  }, [isAuthenticated, status, isKycPage]);

  if (!shouldShow) return null;

  const description =
    status === "error"
      ? "Não foi possível validar seu cadastro agora. Tente novamente."
      : "Complete o cadastro KYC para liberar 100% da plataforma, incluindo a criação de produtos.";

  const goToKyc = () => {
    if (pathname !== "/kyc") {
      router.push("/kyc");
    }
  };

  return (
    <div className="sticky top-0 z-2 flex w-full items-center justify-between gap-4 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-50 backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20">
          {status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin text-amber-300" aria-hidden />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-300" aria-hidden />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold leading-tight">Complete seu cadastro</p>
          <p className="text-xs text-amber-50/90">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={goToKyc}
        className="inline-flex items-center justify-center rounded-[8px] bg-amber-400 px-3 py-2 text-xs font-semibold text-amber-950 transition hover:bg-amber-300"
      >
        Concluir cadastro
      </button>
    </div>
  );
}
