import type { Withdrawal } from "@/types/withdrawal";

type WithdrawalDetailPanelProps = {
  withdrawal: Withdrawal | null;
  statusStyles: Record<Withdrawal["status"], string>;
  cardSurfaceClassName: string;
};

const STATUS_AUTHOR = "Sistema automático";

const formatDocument = (id: string) => {
  const digits = id.replace(/\D/g, "").padEnd(11, "0").slice(0, 11);
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const buildPixKey = (withdrawal: Withdrawal) => `PIX-${withdrawal.id.replace("#", "")}`;

export default function WithdrawalDetailPanel({ withdrawal, statusStyles, cardSurfaceClassName }: WithdrawalDetailPanelProps) {
  if (!withdrawal) {
    return (
      <section className={`${cardSurfaceClassName} rounded-[12px] p-6`}>
        <p className="text-lg font-semibold text-foreground">Selecione um saque para visualizar os detalhes</p>
      </section>
    );
  }

  const approvalDate = withdrawal.status === "Aprovado" ? withdrawal.date : "—";
  const approvalTime = withdrawal.status === "Aprovado" ? withdrawal.time : "—";
  const producerName = withdrawal.email.split("@")[0];

  return (
    <section className={`${cardSurfaceClassName} rounded-[12px] p-6`}>
      <header className="flex flex-col gap-1 border-b border-foreground/10 pb-4">
        <p className="text-lg font-semibold text-foreground">Análise da solicitação</p>
        <span className="text-sm text-muted-foreground">Detalhamento e histórico da requisição selecionada</span>
      </header>

      <div className="flex flex-col gap-4 pt-4">
        <article className="rounded-[12px] border border-foreground/10 bg-muted/10 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-base font-semibold text-foreground">Dados da solicitação</p>
            <span className="text-sm text-muted-foreground">ID: {withdrawal.id}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor do saque</p>
              <p className="text-2xl font-semibold text-foreground">{withdrawal.value}</p>
              <p className="text-xs text-muted-foreground">Taxa de saque: R$ 00,00</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data da solicitação</p>
              <p className="text-base font-medium text-foreground">{withdrawal.date}</p>
              <p className="text-xs text-muted-foreground">{withdrawal.time}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data da aprovação</p>
              <p className="text-base font-medium text-foreground">{approvalDate}</p>
              <p className="text-xs text-muted-foreground">{approvalTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex flex-col gap-1">
                <span className={`inline-flex w-[130px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[withdrawal.status]}`}>
                  {withdrawal.status}
                </span>
                <span className="text-xs text-muted-foreground">por {STATUS_AUTHOR}</span>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-[12px] border border-foreground/10 bg-muted/10 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-base font-semibold text-foreground">Dados do produtor</p>
            <span className="text-sm text-muted-foreground">ID: {withdrawal.id}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Nome</p>
              <p className="text-base font-semibold text-foreground">{producerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">E-mail</p>
              <p className="text-base font-semibold text-foreground">{withdrawal.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Chave pix</p>
              <p className="text-base font-semibold text-foreground">{buildPixKey(withdrawal)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Documento</p>
              <p className="text-base font-semibold text-foreground">{formatDocument(withdrawal.id)}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
