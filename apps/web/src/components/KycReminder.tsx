'use client';

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { kycApi } from "@/lib/api";

type KycState = "idle" | "loading" | "none" | "pending" | "complete" | "error";

export default function KycReminder() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<KycState>("idle");
  const isKycPage = pathname?.startsWith("/kyc");
  const isProfilePage =
    pathname?.startsWith("/minha-conta") || pathname?.startsWith("/perfil") || pathname?.startsWith("/profile");

  useEffect(() => {
    let active = true;

    const checkStatus = async () => {
      if (!isAuthenticated || !token) {
        setStatus("idle");
        return;
      }
      setStatus("loading");
      try {
        const profileStatus = user?.kyc?.status || user?.status;
        const isApproved = (status?: string) =>
          status ? ["approved", "aprovado", "complete", "completed", "validado", "APPROVED"].includes(status) : false;
        const isPendingStatus = (status?: string) =>
          status
            ? [
                "in_progress",
                "processing",
                "waiting",
                "pending",
                "em_analise",
                "in_review",
                "review",
                "IN_PROGRESS",
                "PENDING",
              ].includes(status)
            : false;

        if (profileStatus) {
          if (isApproved(profileStatus)) {
            if (active) setStatus("complete");
            return;
          }
          if (isPendingStatus(profileStatus)) {
            if (active) setStatus("pending");
            return;
          }
          // "pending" ou demais valores caem no fluxo abaixo
        }

        const statusInfo = await kycApi.getStatus(token);
        if (!active) return;
        const raw = statusInfo.rawStatus;
        if (isApproved(raw)) {
          setStatus("complete");
        } else if (isPendingStatus(raw)) {
          setStatus("pending");
        } else if (statusInfo.exists) {
          // default: existe mas não aprovado -> tratar como em análise
          setStatus("pending");
        } else {
          setStatus("none");
        }
      } catch {
        if (!active) return;
        setStatus("error");
      }
    };

    void checkStatus();
    return () => {
      active = false;
    };
  }, [isAuthenticated, token, user?.status, user?.kyc?.status]);

  const shouldShow = useMemo(() => {
    if (isKycPage) return false;
    if (!isAuthenticated) return false;
    // Evita piscar enquanto consulta status
    if (status === "idle" || status === "loading") return false;
    if (status === "complete") return false;
    // Em análise: mostra apenas no perfil
    if (status === "pending") return isProfilePage;
    // Mantém aviso em caso de erro ou KYC inexistente
    return true;
  }, [isAuthenticated, status, isKycPage, isProfilePage]);

  if (!shouldShow) return null;

  const isPending = status === "pending";
  const description = (() => {
    if (status === "error") {
      return "Não foi possível validar seu cadastro agora. Tente novamente.";
    }
    if (isPending) {
      return "Cadastro em análise, por favor aguarde.";
    }
    return "Complete o cadastro KYC para liberar 100% da plataforma, incluindo a criação de produtos.";
  })();

  const goToKyc = () => {
    if (pathname !== "/kyc") {
      router.push("/kyc");
    }
  };

  return (
    <div className="sticky top-0 z-30 flex w-full items-center justify-between gap-4 border-b border-amber-500/30 bg-amber-50/90 px-4 py-3 text-amber-900 backdrop-blur dark:bg-amber-500/10 dark:text-amber-50">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-200/80 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300">
          {status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <AlertTriangle className="h-5 w-5" aria-hidden />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold leading-tight">
            {isPending ? "Cadastro em análise" : "Complete seu cadastro"}
          </p>
          <p className="text-xs text-amber-900/80 dark:text-amber-50/90">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={goToKyc}
        className="inline-flex items-center justify-center rounded-[8px] bg-amber-400 px-3 py-2 text-xs font-semibold text-amber-950 transition hover:bg-amber-300 dark:bg-amber-400 dark:text-amber-950"
      >
        {isPending ? "Ver cadastro" : "Concluir cadastro"}
      </button>
    </div>
  );
}
