import type { Dispatch, SetStateAction } from "react";
import { SectionCard, fieldClass } from "../shared";

type PaymentsSectionProps = {
  acceptedDocuments: Array<"cpf" | "cnpj">;
  setAcceptedDocuments: Dispatch<SetStateAction<Array<"cpf" | "cnpj">>>;
  paymentMethods: Array<"card" | "boleto" | "pix">;
  setPaymentMethods: Dispatch<SetStateAction<Array<"card" | "boleto" | "pix">>>;
  couponEnabled: boolean;
  setCouponEnabled: Dispatch<SetStateAction<boolean>>;
  discountCard: string;
  setDiscountCard: Dispatch<SetStateAction<string>>;
  discountPix: string;
  setDiscountPix: Dispatch<SetStateAction<string>>;
  discountBoleto: string;
  setDiscountBoleto: Dispatch<SetStateAction<string>>;
  installmentsLimit: string;
  setInstallmentsLimit: Dispatch<SetStateAction<string>>;
  installmentsPreselected: string;
  setInstallmentsPreselected: Dispatch<SetStateAction<string>>;
  boletoDueDays: string;
  setBoletoDueDays: Dispatch<SetStateAction<string>>;
  pixExpireMinutes: string;
  setPixExpireMinutes: Dispatch<SetStateAction<string>>;
  showSellerDetail: boolean;
  setShowSellerDetail: Dispatch<SetStateAction<boolean>>;
  preferenceRequireAddress: boolean;
  setPreferenceRequireAddress: Dispatch<SetStateAction<boolean>>;
};

export const PaymentsSection = ({
  acceptedDocuments,
  setAcceptedDocuments,
  paymentMethods,
  setPaymentMethods,
  couponEnabled,
  setCouponEnabled,
  discountCard,
  setDiscountCard,
  discountPix,
  setDiscountPix,
  discountBoleto,
  setDiscountBoleto,
  installmentsLimit,
  setInstallmentsLimit,
  installmentsPreselected,
  setInstallmentsPreselected,
  boletoDueDays,
  setBoletoDueDays,
  pixExpireMinutes,
  setPixExpireMinutes,
  showSellerDetail,
  setShowSellerDetail,
  preferenceRequireAddress,
  setPreferenceRequireAddress,
}: PaymentsSectionProps) => {
  const formatPercentInput = (value: string) => {
    const numeric = value.replace(/\D/g, "");
    if (!numeric) return "";
    const parsed = Number.parseInt(numeric, 10);
    if (Number.isNaN(parsed)) return "";
    return String(Math.min(100, parsed));
  };

  return (
    <SectionCard title="Pagamentos" iconSrc="/images/editar-produtos/pagamentos.svg">
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">Aceitar pagamentos de</p>
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "CPF", value: "cpf" },
          { label: "CNPJ", value: "cnpj" },
        ].map(doc => {
          const active = acceptedDocuments.includes(doc.value as "cpf" | "cnpj");
          return (
            <button
              key={doc.value}
              type="button"
              className={`rounded-[8px] border px-3 py-2 text-xs font-semibold transition ${
                active
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-foreground/20 bg-card text-foreground"
              }`}
              onClick={() =>
                setAcceptedDocuments(prev => {
                  const exists = prev.includes(doc.value as "cpf" | "cnpj");
                  if (exists) {
                    const next = prev.filter(item => item !== doc.value);
                    return next.length ? next : prev;
                  }
                  return [...prev, doc.value as "cpf" | "cnpj"];
                })
              }
            >
              {doc.label}
            </button>
          );
        })}
      </div>
      <p className="text-sm font-semibold text-foreground">Métodos aceitos</p>
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "Cartão de crédito", value: "card" },
          { label: "Boleto", value: "boleto" },
          { label: "Pix", value: "pix" },
        ].map(method => {
          const active = paymentMethods.includes(method.value as "card" | "boleto" | "pix");
          return (
            <button
              key={method.value}
              type="button"
              className={`rounded-[8px] border px-3 py-2 text-xs font-semibold transition ${
                active
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-foreground/20 bg-card text-foreground"
              }`}
              onClick={() =>
                setPaymentMethods(prev => {
                  const exists = prev.includes(method.value as "card" | "boleto" | "pix");
                  if (exists) {
                    return prev.filter(item => item !== method.value);
                  }
                  return [...prev, method.value as "card" | "boleto" | "pix"];
                })
              }
            >
              {method.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-sm font-semibold text-foreground pt-2">
        <span>Cupom de desconto</span>
        <button
          type="button"
          className={`relative inline-flex h-5 w-10 items-center rounded-full ${couponEnabled ? "bg-primary/70" : "bg-muted"}`}
          onClick={() => setCouponEnabled(prev => !prev)}
        >
          <span
            className={`absolute h-4 w-4 rounded-full bg-white transition ${
              couponEnabled ? "left-[calc(100%-18px)]" : "left-[6px]"
            }`}
          />
        </button>
      </div>
      <p className="text-sm font-semibold text-foreground">Descontos</p>
      <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-xs text-muted-foreground">
              <span>Cartão de crédito</span>
              <div className="relative">
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`${fieldClass} pr-10`}
                  placeholder="0"
                  value={discountCard}
                  onChange={event => setDiscountCard(formatPercentInput(event.target.value))}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
              </div>
            </label>
            <label className="space-y-2 text-xs text-muted-foreground">
              <span>Pix</span>
              <div className="relative">
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`${fieldClass} pr-10`}
                  placeholder="0"
                  value={discountPix}
                  onChange={event => setDiscountPix(formatPercentInput(event.target.value))}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
              </div>
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-xs text-muted-foreground">
              <span>Boleto</span>
              <div className="relative">
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`${fieldClass} pr-10`}
                  placeholder="0"
                  value={discountBoleto}
                  onChange={event => setDiscountBoleto(formatPercentInput(event.target.value))}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
              </div>
            </label>
            <div className="hidden sm:block" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Cartão de crédito</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="relative">
                <input
                  className={`${fieldClass} pr-8`}
                  placeholder="Limite de parcelas"
                  value={installmentsLimit}
                  onChange={event => setInstallmentsLimit(event.target.value.replace(/\D/g, ""))}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">x</span>
              </div>
              <div className="relative">
                <input
                  className={`${fieldClass} pr-8`}
                  placeholder="Parcela pré-selecionada"
                  value={installmentsPreselected}
                  onChange={event => setInstallmentsPreselected(event.target.value.replace(/\D/g, ""))}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">x</span>
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            <p className="text-sm font-semibold text-foreground">Boleto</p>
            <label className="space-y-2 text-xs text-muted-foreground">
              <span>Dias para vencimento</span>
              <div className="relative">
                <select
                  className={`${fieldClass} appearance-none pr-10`}
                  value={boletoDueDays}
                  onChange={event => setBoletoDueDays(event.target.value)}
                >
                  {["1", "2", "3", "4", "5"].map(day => (
                    <option key={day} value={day}>
                      {day} dia{day === "1" ? "" : "s"}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                  ▾
                </span>
              </div>
            </label>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Pix</p>
            <label className="space-y-2 text-xs text-muted-foreground">
              <span>Tempo de expiração</span>
              <div className="relative">
                <input
                  type="number"
                  className={`${fieldClass} pr-16`}
                  placeholder="00"
                  min={0}
                  value={pixExpireMinutes}
                  onChange={event => setPixExpireMinutes(event.target.value.replace(/\D/g, ""))}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">Minutos</span>
              </div>
            </label>
          </div>
        </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Preferências</p>
        <div className="space-y-2 text-xs text-muted-foreground">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="ui-checkbox"
              checked={showSellerDetail}
              onChange={event => setShowSellerDetail(event.target.checked)}
            />
            Mostrar nomes do vendedor no rodapé
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="ui-checkbox"
              checked={preferenceRequireAddress}
              onChange={event => setPreferenceRequireAddress(event.target.checked)}
            />
            Solicitar endereço do comprador
          </label>
        </div>
      </div>
    </div>
    </SectionCard>
  );
};
