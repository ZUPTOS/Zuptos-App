'use client';

import { Calendar, Filter, Search, X } from "lucide-react";
import { useMemo } from "react";

interface Option {
  id: string;
  label: string;
}

interface SalesFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  onAddFilter?: () => void;
}

const ofertaOptions: Option[] = [
  { id: "assinatura", label: "Assinatura" },
  { id: "preco_unico", label: "Preço único" }
];

const statusOptions: Option[] = [
  { id: "aprovada", label: "Aprovada" },
  { id: "pendente", label: "Pendente" },
  { id: "recusada", label: "Recusada" }
];

const tipoOptions: Option[] = [
  { id: "curso", label: "Curso" },
  { id: "ebook", label: "E-Book ou arquivo" },
  { id: "servico", label: "Serviço" }
];

const vendedorOptions: Option[] = [
  { id: "autoral", label: "Autoral" },
  { id: "co", label: "Co-produção" }
];

const ToggleButton = ({ label }: { label: string }) => (
  <button
    type="button"
    className="flex items-center gap-2 rounded-[8px] border border-muted px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/60 hover:text-primary"
  >
    <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border border-muted" />
    {label}
  </button>
);

const InputField = ({
  label,
  placeholder,
  icon
}: {
  label: string;
  placeholder: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <p className="text-sm font-semibold text-card-foreground">{label}</p>
    <label className="flex items-center gap-2 rounded-[10px] border border-muted bg-background/60 px-3 py-3 text-xs text-muted-foreground focus-within:border-primary/60 focus-within:text-primary">
      {icon}
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent text-xs text-card-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </label>
  </div>
);

export default function SalesFilterPanel({
  isOpen,
  onClose,
  onApply,
  onAddFilter
}: SalesFilterPanelProps) {
  const wrapperClasses = useMemo(
    () =>
      `absolute -top-[120px] right-40 w-[454px] max-h-[800px] overflow-y-auto rounded-[16px] border border-muted bg-background custom-scrollbar z-50 ${
        isOpen
          ? "pointer-events-auto opacity-100 translate-y-0"
          : "pointer-events-none opacity-0 -translate-y-3"
      }`,
    [isOpen]
  );

  return (
    <aside className={wrapperClasses}>
      <div className="flex items-center justify-between border-b border-muted px-4 py-3">
        <p className="text-sm font-semibold text-card-foreground">Filtrar</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-muted-foreground transition hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col gap-4 px-4 py-4 text-sm">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-card-foreground">Data</p>
          <label className="flex items-center gap-2 rounded-[10px] border border-muted bg-background/60 px-3 py-3 text-xs text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <input
              type="text"
              placeholder="Selecionar data"
              className="w-full bg-transparent text-xs text-card-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </label>
        </div>

        <InputField
          label="Produto"
          placeholder="Buscar produto"
          icon={<Search className="h-4 w-4" />}
        />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-card-foreground">Oferta</p>
          <div className="flex flex-wrap gap-3">
            {ofertaOptions.map(option => (
              <ToggleButton key={option.id} label={option.label} />
            ))}
          </div>
        </div>

        <InputField
          label="Método de pagamento"
          placeholder="Todos"
          icon={<Search className="h-4 w-4" />}
        />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-card-foreground">Status da venda</p>
          <div className="flex flex-wrap gap-3">
            {statusOptions.map(option => (
              <ToggleButton key={option.id} label={option.label} />
            ))}
          </div>
        </div>

        <InputField
          label="E-mail do comprador"
          placeholder="Insira o e-mail"
        />
        <InputField
          label="Cupom de desconto"
          placeholder="Insira o cupom de desconto"
        />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-card-foreground">Tipo</p>
          <div className="flex flex-wrap gap-3">
            {tipoOptions.map(option => (
              <ToggleButton key={option.id} label={option.label} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-card-foreground">Vendedor</p>
          <div className="flex flex-wrap gap-3">
            {vendedorOptions.map(option => (
              <ToggleButton key={option.id} label={option.label} />
            ))}
          </div>
        </div>

        <InputField
          label="UTM"
          placeholder="Pesquisar UTM"
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      <div className="flex items-center gap-3 border-t border-muted px-4 py-3">
        <button
          type="button"
          onClick={onAddFilter}
          className="flex-1 rounded-[10px] border border-muted px-4 py-2 text-sm font-semibold text-card-foreground transition hover:border-primary/60 hover:text-primary"
        >
          Adicionar filtro
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Aplicar
        </button>
      </div>
    </aside>
  );
}
