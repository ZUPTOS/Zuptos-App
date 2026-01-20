import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import mockData from "@/data/mockData.json";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";

type KycProfile = {
  status?: string;
  accountType?: string;
  document?: string;
  phone?: string;
  socialName?: string;
  ownerName?: string;
  averageRevenue?: string | number;
  mediumTicket?: string | number;
  kycAddress?: {
    address?: string;
    number?: string;
    complement?: string;
    state?: string;
    city?: string;
    neighborhood?: string;
  };
};

type ProfileResponse = {
  username?: string;
  email?: string;
  fullName?: string;
  role?: string;
  kyc?: KycProfile;
  status?: string;
};

const APPROVED = ["approved", "aprovado", "complete", "completed", "validado"];
const IN_PROGRESS = ["in_progress", "processing", "pending", "waiting"];

export default function MyAccountView() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await authApi.getCurrentUser(token);
        const data =
          (response as { data?: ProfileResponse })?.data ??
          (response as ProfileResponse);
        setProfile(data ?? null);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, [token]);

  const resolvedProfile = useMemo(() => {
    const base: ProfileResponse = profile ?? {};
    const name = base.fullName || base.username || user?.fullName || user?.username || mockData.user.name;
    const email = base.email || user?.email || mockData.user.email;
    const kyc = base.kyc;
    const addressParts = [
      kyc?.kycAddress?.address,
      kyc?.kycAddress?.number,
      kyc?.kycAddress?.city,
      kyc?.kycAddress?.state,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      name,
      email,
      accountType: kyc?.accountType || "—",
      phone: kyc?.phone || "—",
      document: kyc?.document || "—",
      address: addressParts || "—",
      status: (kyc?.status || base.status || user?.status)?.toLowerCase(),
    };
  }, [profile, user]);

  const documentationStatus = useMemo(() => {
    if (!resolvedProfile.status) {
      return {
        label: "Pendente",
        message: "Complete seu cadastro para liberar todas as funcionalidades.",
        tone: "pending" as const,
      };
    }
    if (APPROVED.includes(resolvedProfile.status)) {
      return {
        label: "Aprovado",
        message: "Seus documentos foram aprovados. Você já pode vender!",
        tone: "approved" as const,
      };
    }
    if (IN_PROGRESS.includes(resolvedProfile.status)) {
      return {
        label: "Em análise",
        message: "Cadastro em análise, por favor aguarde.",
        tone: "pending" as const,
      };
    }
    return {
      label: resolvedProfile.status.toUpperCase(),
      message: "Cadastro em análise, por favor aguarde.",
      tone: "pending" as const,
    };
  }, [resolvedProfile.status]);

  const infoFields = [
    { label: "Tipo de Conta", value: resolvedProfile.accountType },
    { label: "Telefone", value: resolvedProfile.phone },
    { label: "Documento", value: resolvedProfile.document },
    { label: "Endereço", value: resolvedProfile.address },
  ];

  const userInitial = resolvedProfile.name?.charAt(0)?.toUpperCase() ?? "Z";

  return (
    <DashboardLayout
      userName={resolvedProfile.name}
      userLocation={user?.accessType || mockData.user.location}
      pageTitle=""
    >
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Meu perfil</h1>

          <div className="space-y-5 rounded-[14px] border border-foreground/10 bg-card/80 p-6 shadow-[0_14px_36px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-4 rounded-[12px] border border-foreground/10 bg-card/80 p-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/70 text-xl font-semibold text-background sm:h-20 sm:w-20">
                {userInitial}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground sm:text-xl">{resolvedProfile.name}</p>
                <p className="text-sm text-muted-foreground">{resolvedProfile.email}</p>
                {isLoading && <p className="text-xs text-muted-foreground">Atualizando dados...</p>}
              </div>
            </div>

            <div className="grid gap-5 rounded-[12px] border border-foreground/10 bg-card/70 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {infoFields.map((field) => (
                <div key={field.label} className="space-y-1">
                  <p className="text-[13px] text-muted-foreground">{field.label}</p>
                  <p className="text-base font-semibold text-foreground sm:text-lg">{field.value}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                className="rounded-[10px] border border-foreground/15 bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/25 hover:bg-card/70"
              >
                Editar informações
              </button>
            </div>
          </div>

          <div className="space-y-4 rounded-[14px] border border-foreground/10 bg-card/80 p-6 shadow-[0_14px_36px_rgba(0,0,0,0.35)]">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Status da Documentação</h2>
              <p className="text-sm text-muted-foreground">Verifique o status dos seus documentos</p>
            </div>

            <div className="flex flex-col gap-4 rounded-[12px] border border-foreground/10 bg-card/70 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <span
                  className="inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold"
                  style={{
                    backgroundColor:
                      documentationStatus.tone === "approved" ? "rgba(16,185,129,0.2)" : "rgba(234,179,8,0.15)",
                    color: documentationStatus.tone === "approved" ? "#34d399" : "#facc15",
                  }}
                >
                  {documentationStatus.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground sm:text-base sm:max-w-md">{documentationStatus.message}</p>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
