import DashboardLayout from "@/components/DashboardLayout";
import mockData from "@/data/mockData.json";

export default function MyAccountView() {
  const profileData = {
    accountType: "Pessoa jurídica",
    phone: "xxxxxxxxxxxxxxx",
    document: "xxxxxxxxxxxxxxx",
    address: "Pessoa jurídica",
    birthDate: "dd/mm/aaaa",
  };

  const documentationStatus = {
    label: "Aprovado",
    message: "Seus documentos foram aprovados. Você já pode vender!",
  };

  const infoFields = [
    { label: "Tipo de Conta", value: profileData.accountType },
    { label: "Telefone", value: profileData.phone },
    { label: "Documento", value: profileData.document },
    { label: "Endereço", value: profileData.address },
    { label: "Data de nascimento", value: profileData.birthDate },
  ];

  const userInitial = mockData.user.name?.charAt(0)?.toUpperCase() ?? "Z";

  return (
    <DashboardLayout
      userName={mockData.user.name}
      userLocation={mockData.user.location}
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
                <p className="text-lg font-semibold text-foreground sm:text-xl">{mockData.user.name}</p>
                <p className="text-sm text-muted-foreground">{mockData.user.email}</p>
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
                <span className="inline-flex items-center rounded-full bg-emerald-700/25 px-4 py-1 text-sm font-semibold text-emerald-400">
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
