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
      <section className="px-90 py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col space-y-6">
          <h1 className="text-[28px] font-semibold text-foreground">Meu perfil</h1>

          <div className="space-y-6 rounded-2xl border border-border/70 bg-gradient-to-b from-background/70 to-background/40 p-6 shadow-2xl shadow-black/30">
            <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/50 p-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/10 text-xl font-semibold text-foreground">
                {userInitial}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{mockData.user.name}</p>
                <p className="text-sm text-muted-foreground">{mockData.user.email}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {infoFields.map((field) => (
                <div key={field.label} className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <p className="text-[12px] uppercase tracking-wide text-muted-foreground">{field.label}</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{field.value}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-xl border border-border/80 px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-foreground/10"
              >
                Editar informações
              </button>
            </div>
          </div>

          <div className="space-y-6 rounded-2xl border border-border/70 bg-gradient-to-b from-background/70 to-background/40 p-6 shadow-2xl shadow-black/30">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Status da Documentação</h2>
              <p className="text-sm text-muted-foreground">Verifique o status dos seus documentos</p>
            </div>

            <div className="flex flex-col gap-6 rounded-2xl border border-border/60 bg-background/50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <span className="mt-3 inline-flex items-center rounded-full bg-green-500/10 px-4 py-1 text-sm font-semibold text-green-400">
                  {documentationStatus.label}
                </span>
              </div>

              <p className="text-sm text-foreground sm:max-w-md">{documentationStatus.message}</p>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
