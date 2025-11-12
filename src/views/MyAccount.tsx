import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import mockData from "@/data/mockData.json";

const inputClasses =
  "h-12 w-full rounded-[8px] border border-border/70 bg-background/10 px-4 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:bg-background/20 focus:outline-none focus:ring-2 focus:ring-primary/40";

const primaryButtonClasses =
  "inline-flex w-[147px] h-[49px] sm:w-auto items-center justify-center rounded-[8px] bg-primary px-3 py-3 text-sora font-semibold text-[14px] transition hover:bg-muted/30";

const secondaryButtonClasses =
  "inline-flex w-[147px] h-[49px] sm:w-auto items-center justify-center rounded-[8px] border border-border/80 bg-foreground/10 px-7 py-3 text-sora font-semibold text-[14px] transition hover:bg-muted/30";

export default function MyAccountView() {
  return (
    <DashboardLayout
      userName={mockData.user.name}
      userLocation={mockData.user.location}
      pageTitle=""
    >
      <section className="flex px-90">
        <div className="w-[749px] h-[524px] space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="mt-2 text-[28px] font-semibold text-foreground">Minha conta</h1>
          </div>

          <div className="rounded-[8px] border border-border/70 bg-card p-6">
            <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
              <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
                <div className="flex h-[220px] w-[220px] items-center justify-center rounded-[26px]">
                  <Image
                    src="/images/logoSide.svg"
                    alt="Zuptos"
                    width={140}
                    height={140}
                    className="h-[130px] w-[130px] object-contain"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Seu nome</label>
                  <input className={inputClasses} type="text" placeholder="Insira o nome" defaultValue={mockData.user.name} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Seu e-mail</label>
                  <input className={inputClasses} type="email" placeholder="Insira o seu e-mail" defaultValue={mockData.user.email} />
                </div>
                <div className="flex justify-end pt-2">
                  <button type="button" className={primaryButtonClasses}>
                    Atualizar seus dados
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-4 border-t border-border/60 pt-8">
              <p className="text-sm font-semibold text-foreground">Quer redefinir sua senha?</p>
              <input className={inputClasses} type="password" placeholder="Insira a sua senha antiga" />
              <input className={inputClasses} type="password" placeholder="Insira a sua senha nova" />
              <div className="flex justify-end pt-2">
                <button type="button" className={secondaryButtonClasses}>
                  Redefinir senha
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
