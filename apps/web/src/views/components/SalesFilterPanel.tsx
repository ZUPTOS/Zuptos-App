'use client';

import { Search, X } from "lucide-react";
import DateFilter from "@/components/DateFilter";

export type OfferFilter = "assinatura" | "preco_unico";

export interface SalesFilters {
  dateFrom: string;
  dateTo: string;
  product: string;
  paymentMethod: string;
  offers: OfferFilter[];
  statuses: string[];
  buyerEmail: string;
  coupon: string;
  tipos: string[];
  vendedor: string[];
  utm: string;
}

interface ToggleOption {
  id: string;
  label: string;
  value: string;
}

interface SalesFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SalesFilters;
  onFiltersChange: (patch: Partial<SalesFilters>) => void;
  onApply?: () => void;
}

const ofertaOptions: ToggleOption[] = [
  { id: "assinatura", label: "Assinatura", value: "assinatura" },
  { id: "preco_unico", label: "Preço único", value: "preco_unico" }
];

const statusOptions: ToggleOption[] = [
  { id: "aprovada", label: "Aprovada", value: "aprovada" },
  { id: "pendente", label: "Pendente", value: "pendente" },
  { id: "recusada", label: "Recusada", value: "recusada" }
];

const tipoOptions: ToggleOption[] = [
  { id: "curso", label: "Curso", value: "Curso" },
  { id: "ebook", label: "E-Book ou arquivo", value: "E-Book ou arquivo" },
  { id: "servico", label: "Serviço", value: "Serviço" }
];

const vendedorOptions: ToggleOption[] = [
  { id: "autoral", label: "Autoral", value: "Produtor" },
  { id: "co-producao", label: "Co-produção", value: "Co-produtor" }
];

const ToggleButton = ({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 rounded-[8px] border px-3 py-2 text-xs font-semibold transition ${
      active
        ? "border-primary/70 bg-primary/10 text-primary"
        : "border-muted text-muted-foreground hover:border-primary/60 hover:text-primary"
    }`}
  >
    <span
      className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border ${
        active ? "border-primary bg-primary/60" : "border-muted"
      }`}
    />
    {label}
  </button>
);

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  type?: string;
}) => (
  <div className="flex flex-col gap-3">
    <p className="text-sm font-semibold text-card-foreground">{label}</p>
    <label className="flex items-center gap-3 rounded-[10px] border border-muted bg-card/70 px-4 py-3 text-sm text-muted-foreground focus-within:border-primary/60 focus-within:text-primary">
      {icon}
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </label>
  </div>
);

export default function SalesFilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApply
}: SalesFilterPanelProps) {
  const handleArrayToggle = (
    key: keyof Pick<SalesFilters, "offers" | "statuses" | "tipos" | "vendedor">,
    value: string
  ) => {
    const current = filters[key];
    const exists = current.includes(value as OfferFilter);
    const updated = exists
      ? current.filter(item => item !== value)
      : [...current, value as OfferFilter];
    onFiltersChange({ [key]: updated } as Partial<SalesFilters>);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex transition-opacity duration-200 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="presentation"
    >
      <button
        type="button"
        onClick={onClose}
        className="flex-1 bg-black/40 transition-opacity duration-200"
        aria-label="Fechar filtros"
      />
      <aside
        className={`relative flex w-[480px] h-full shrink-0 flex-col overflow-y-auto bg-card shadow-2xl custom-scrollbar transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
      <div className="flex items-center justify-between border-b border-muted px-5 py-4">
        <p className="text-sm font-semibold text-card-foreground tracking-wide">Filtrar</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-muted-foreground transition hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col gap-4 px-5 py-5 text-sm">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-card-foreground">Data</p>
          <DateFilter
            onDateChange={(start, end) =>
              onFiltersChange({
                dateFrom: start.toISOString().slice(0, 10),
                dateTo: end.toISOString().slice(0, 10)
              })
            }
          />
        </div>

        <InputField
          label="Produto"
          value={filters.product}
          onChange={value => onFiltersChange({ product: value })}
          placeholder="Buscar produto"
          icon={<Search className="h-4 w-4" />}
        />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-card-foreground">Oferta</p>
          <div className="flex flex-wrap gap-3">
            {ofertaOptions.map(option => (
              <ToggleButton
                key={option.id}
                label={option.label}
                active={filters.offers.includes(option.value as OfferFilter)}
                onClick={() => handleArrayToggle("offers", option.value)}
              />
            ))}
          </div>
        </div>

        <InputField
          label="Método de pagamento"
          value={filters.paymentMethod}
          onChange={value => onFiltersChange({ paymentMethod: value })}
          placeholder="Todos"
          icon={<Search className="h-4 w-4" />}
        />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-card-foreground">
            Status da venda
          </p>
          <div className="flex flex-wrap gap-3">
            {statusOptions.map(option => (
              <ToggleButton
                key={option.id}
                label={option.label}
                active={filters.statuses.includes(option.value)}
                onClick={() => handleArrayToggle("statuses", option.value)}
              />
            ))}
          </div>
        </div>

        <InputField
          label="E-mail do comprador"
          value={filters.buyerEmail}
          onChange={value => onFiltersChange({ buyerEmail: value })}
          placeholder="Insira o e-mail"
        />
        <InputField
          label="Cupom de desconto"
          value={filters.coupon}
          onChange={value => onFiltersChange({ coupon: value })}
          placeholder="Insira o cupom de desconto"
        />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-card-foreground">Tipo</p>
          <div className="flex flex-wrap gap-3">
            {tipoOptions.map(option => (
              <ToggleButton
                key={option.id}
                label={option.label}
                active={filters.tipos.includes(option.value)}
                onClick={() => handleArrayToggle("tipos", option.value)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-card-foreground">Vendedor</p>
          <div className="flex flex-wrap gap-3">
            {vendedorOptions.map(option => (
              <ToggleButton
                key={option.id}
                label={option.label}
                active={filters.vendedor.includes(option.value)}
                onClick={() => handleArrayToggle("vendedor", option.value)}
              />
            ))}
          </div>
        </div>

        <InputField
          label="UTM"
          value={filters.utm}
          onChange={value => onFiltersChange({ utm: value })}
          placeholder="Pesquisar UTM"
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      <div className="flex justify-end border-t border-muted px-4 py-3">
        <button
          type="button"
          onClick={() => onApply?.()}
          className="ml-auto w-[158px] rounded-[10px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Adicionar filtro
        </button>
      </div>
      </aside>
    </div>
  );
}
