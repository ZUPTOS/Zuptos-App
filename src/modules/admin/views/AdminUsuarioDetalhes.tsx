'use client';

import { Ban, ChevronDown, KeyRound, LogIn, PhoneCall, X } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminUserDetail } from "@/modules/admin/hooks";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { Input } from "@/shared/ui/input";
import { cn } from "@/lib/utils";

const userMock = {
  name: "Nome",
  document: "XX-XXX-XXX.XX",
  razao: "XXXXXXXXXXXX",
  tipoConta: "Pessoa jurídica",
  dataCriacao: "05/06/2025",
  horaCriacao: "às 18:45"
};

const tabs = [
  { id: "taxas", label: "Alterar taxas" },
  { id: "permissoes", label: "Alterar permissões" },
  { id: "financeiro", label: "Financeiro" },
  { id: "indicacoes", label: "Indicações" },
  { id: "acoes", label: "Ações" }
] as const;

type TabId = (typeof tabs)[number]["id"];

type FieldProps = {
  label: string;
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
};

function Field({ label, placeholder, className, value, onChange }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-2 text-sm", className)}>
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <Input
        placeholder={placeholder}
        value={value ?? ""}
        onChange={event => onChange?.(event.target.value)}
        className="h-[46px] rounded-[8px] border border-foreground/15 bg-card/40 text-sm text-foreground placeholder:text-muted-foreground"
      />
    </label>
  );
}

function TaxCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[8px] border border-foreground/12 bg-card/70 p-4 sm:p-5">
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <div className="mt-4 grid gap-3">{children}</div>
    </div>
  );
}

function InfoCard({ title, value, className }: { title: string; value: string; className?: string }) {
  return (
    <div className={cn("rounded-[8px] border border-foreground/12 bg-card/60 p-4", className)}>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function CheckOption({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-base font-semibold text-muted-foreground select-none">
      <span
        className={`flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          checked ? "border-primary bg-primary text-white" : "border-foreground/10 text-transparent"
        }`}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={onChange}
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onChange();
          }
        }}
      >
        ✓
      </span>
      {label}
    </label>
  );
}

export default function AdminUsuarioDetalhes() {
  const [activeTab, setActiveTab] = useState<TabId>("taxas");
  const [showManageBalance, setShowManageBalance] = useState(false);
  const [showConfirmBalance, setShowConfirmBalance] = useState(false);
  const [newBalanceValue, setNewBalanceValue] = useState("R$0,00");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [permissionToggles, setPermissionToggles] = useState({
    cardCredit: false,
    pix: false,
    boleto: false,
    transferEnabled: false
  });
  const searchParams = useSearchParams();
  const userId = searchParams?.get("id") ?? undefined;
  const { detail } = useAdminUserDetail(userId);
  const displayUser = detail ?? userMock;
  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const number = Number(digits) / 100;
    return number
      .toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 })
      .replace(/\u00a0/g, " ");
  };
  const formatPercent = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const number = Number(digits) / 100;
    return `${number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  };
  const handleFieldChange = (key: string, rawValue: string, type?: "currency" | "percent") => {
    let formatted = rawValue;
    if (type === "currency") {
      formatted = formatCurrency(rawValue);
    } else if (type === "percent") {
      formatted = formatPercent(rawValue);
    }
    setFieldValues(prev => ({ ...prev, [key]: formatted }));
  };
  const getFieldValue = (key: string) => fieldValues[key] ?? "";

  const surface = "rounded-[10px] border border-foreground/10 bg-card/70";
  const installmentLabels = useMemo(
    () => [
      "Cartão (à vista)",
      "Cartão (2x)",
      "Cartão (3x)",
      "Cartão (4x)",
      "Cartão (5x)",
      "Cartão (6x)",
      "Cartão (7x)",
      "Cartão (8x)",
      "Cartão (9x)",
      "Cartão (10x)",
      "Cartão (11x)",
      "Cartão (12x)"
    ],
    []
  );

  const renderContent = () => {
    if (activeTab === "taxas") {
      return (
        <div className={`${surface} p-5 sm:p-6`}>
          <div className="flex flex-col gap-1">
            <p className="text-xl font-semibold text-foreground">Alterar taxas</p>
            <span className="text-sm text-muted-foreground">Essa é a taxa final que a empresa irá pagar</span>
          </div>

          <div className="mt-6 flex flex-col gap-6">
            <div className="max-w-[240px]">
              <span className="text-[13px] text-muted-foreground">Tipo de taxa</span>
              <button
                type="button"
                className="mt-2 flex h-[46px] w-full items-center justify-between rounded-[8px] border border-foreground/15 bg-card/40 px-3 text-sm text-foreground transition hover:border-foreground/30"
              >
                <span>Personalizada</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <TaxCard title="Pix">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Taxa fixa"
                    placeholder="R$0,00"
                    value={getFieldValue("pixTaxaFixa")}
                    onChange={value => handleFieldChange("pixTaxaFixa", value, "currency")}
                  />
                  <Field
                    label="Taxa variável"
                    placeholder="R$0,00"
                    value={getFieldValue("pixTaxaVariavel")}
                    onChange={value => handleFieldChange("pixTaxaVariavel", value, "currency")}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Adquirente"
                    placeholder="Adquirente"
                    value={getFieldValue("pixAdquirente")}
                    onChange={value => handleFieldChange("pixAdquirente", value)}
                  />
                  <Field
                    label="Tempo de liberação"
                    placeholder="D+0"
                    value={getFieldValue("pixTempo")}
                    onChange={value => handleFieldChange("pixTempo", value)}
                  />
                </div>
              </TaxCard>

              <TaxCard title="Boleto">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Taxa fixa"
                    placeholder="R$0,00"
                    value={getFieldValue("boletoTaxaFixa")}
                    onChange={value => handleFieldChange("boletoTaxaFixa", value, "currency")}
                  />
                  <Field
                    label="Taxa variável"
                    placeholder="R$0,00"
                    value={getFieldValue("boletoTaxaVariavel")}
                    onChange={value => handleFieldChange("boletoTaxaVariavel", value, "currency")}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Adquirente"
                    placeholder="Adquirente"
                    value={getFieldValue("boletoAdquirente")}
                    onChange={value => handleFieldChange("boletoAdquirente", value)}
                  />
                  <Field
                    label="Tempo de liberação"
                    placeholder="D+0"
                    value={getFieldValue("boletoTempo")}
                    onChange={value => handleFieldChange("boletoTempo", value)}
                  />
                </div>
              </TaxCard>
            </div>

            <TaxCard title="Cartão de crédito">
              <div className="grid gap-3 md:grid-cols-3">
                <Field
                  label="Taxa fixa"
                  placeholder="R$0,00"
                  value={getFieldValue("creditoTaxaFixa")}
                  onChange={value => handleFieldChange("creditoTaxaFixa", value, "currency")}
                />
                <Field
                  label="Adquirente"
                  placeholder="Adquirente"
                  value={getFieldValue("creditoAdquirente")}
                  onChange={value => handleFieldChange("creditoAdquirente", value)}
                />
                <Field
                  label="Tempo de liberação"
                  placeholder="D+0"
                  value={getFieldValue("creditoTempo")}
                  onChange={value => handleFieldChange("creditoTempo", value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {installmentLabels.map(label => {
                  const key = `credito-${label.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`;
                  return (
                    <Field
                      key={label}
                      label={label}
                      placeholder="0,00%"
                      value={getFieldValue(key)}
                      onChange={value => handleFieldChange(key, value, "percent")}
                    />
                  );
                })}
              </div>
            </TaxCard>

            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-[8px] bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow"
              >
                Atualizar taxas
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "permissoes") {
      return (
        <div className={`${surface} p-5 sm:p-6`}>
          <p className="text-xl font-semibold text-foreground">Alterar permissões</p>
          <div className="mt-6 rounded-[10px] border border-foreground/12 bg-card/60 p-5 sm:p-6">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-2xl font-semibold text-foreground">Meio de pagamentos</p>
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  <CheckOption
                    label="Cartão de crédito"
                    checked={permissionToggles.cardCredit}
                    onChange={() =>
                      setPermissionToggles(prev => ({ ...prev, cardCredit: !prev.cardCredit }))
                    }
                  />
                  <CheckOption
                    label="Pix"
                    checked={permissionToggles.pix}
                    onChange={() =>
                      setPermissionToggles(prev => ({ ...prev, pix: !prev.pix }))
                    }
                  />
                  <CheckOption
                    label="Boleto"
                    checked={permissionToggles.boleto}
                    onChange={() =>
                      setPermissionToggles(prev => ({ ...prev, boleto: !prev.boleto }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-2xl font-semibold text-foreground">Regras de transferência</p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <CheckOption
                    label="Transferência habilitada"
                    checked={permissionToggles.transferEnabled}
                    onChange={() =>
                      setPermissionToggles(prev => ({ ...prev, transferEnabled: !prev.transferEnabled }))
                    }
                  />
                  <button
                    type="button"
                    className="flex h-[46px] items-center gap-2 rounded-[8px] border border-foreground/15 bg-card/40 px-3 text-sm text-muted-foreground"
                  >
                    Aprovar automaticamente
                    <ChevronDown className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field
                  label="Taxa fixa"
                  placeholder="R$0,00"
                  value={getFieldValue("transferTaxaFixa")}
                  onChange={value => handleFieldChange("transferTaxaFixa", value, "currency")}
                />
                <Field
                  label="Taxa variável"
                  placeholder="0,00%"
                  value={getFieldValue("transferTaxaVariavel")}
                  onChange={value => handleFieldChange("transferTaxaVariavel", value, "percent")}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field
                  label="Valor máximo por transferência"
                  placeholder="R$0,00"
                  value={getFieldValue("transferValorMaximo")}
                  onChange={value => handleFieldChange("transferValorMaximo", value, "currency")}
                />
                <Field
                  label="Limite diário de transferência"
                  placeholder="R$0,00"
                  value={getFieldValue("transferLimiteDiario")}
                  onChange={value => handleFieldChange("transferLimiteDiario", value, "currency")}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="rounded-[8px] bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow"
            >
              Atualizar
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === "financeiro") {
      return (
        <div className={`${surface} p-5 sm:p-6`}>
          <p className="text-xl font-semibold text-foreground">Financeiro</p>

          <div className="mt-6 space-y-6">
            <div className="rounded-[10px] border border-foreground/12 bg-card/60 p-5 sm:p-6">
              <p className="text-lg font-semibold text-foreground">Informações financeiras</p>
              <div className="mt-5 grid gap-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <InfoCard title="Total faturado" value="R$00,00" />
                  <InfoCard title="Total sacado" value="R$00,00" />
                  <InfoCard title="Saques pendentes" value="R$00,00" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoCard title="Saldo total" value="R$00,00" />
                  <InfoCard title="Transações aprovadas" value="00" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoCard title="Percentual de chargeback" value="00,00%" />
                  <InfoCard title="Total de chargebacks" value="00" />
                </div>
                <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <InfoCard title="Saldo disponível" value="R$00,00" className="w-full md:w-auto flex-1" />
                  <button
                    type="button"
                    onClick={() => setShowManageBalance(true)}
                    className="inline-flex h-[46px] items-center justify-center rounded-[8px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-4 text-sm font-semibold text-white shadow"
                  >
                    Gerenciar saldo
                  </button>

                  {showManageBalance && (
                    <div className="absolute right-0 top-full z-20 mt-3 w-[320px] rounded-[10px] border border-foreground/15 bg-card p-4 shadow-xl">
                      <div className="flex items-start justify-between">
                        <p className="text-base font-semibold text-foreground">Gerenciar saldo</p>
                        <button type="button" onClick={() => setShowManageBalance(false)} className="text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div className="rounded-[8px] border border-foreground/10 p-3">
                          <span className="text-sm text-muted-foreground">Saldo atual</span>
                          <p className="text-xl font-semibold text-foreground">R$00,00</p>
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Novo saldo</span>
                          <Input
                            placeholder="R$0,00"
                            value={newBalanceValue}
                            onChange={event => setNewBalanceValue(formatCurrency(event.target.value))}
                            className="h-[46px] rounded-[8px] border border-foreground/15 bg-card text-sm text-foreground placeholder:text-muted-foreground !bg-card"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowManageBalance(false)}
                            className="flex-1 rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm font-semibold text-foreground"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowManageBalance(false);
                              setShowConfirmBalance(true);
                            }}
                            className="flex-1 rounded-[8px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-3 py-2 text-sm font-semibold text-white"
                          >
                            Alterar saldo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[10px] border border-foreground/12 bg-card/60 p-5 sm:p-6">
              <p className="text-lg font-semibold text-foreground">Receita da plataforma</p>
              <div className="mt-5 grid gap-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <InfoCard title="Receitas em taxas de transação" value="R$00,00" />
                  <InfoCard title="Receitas líquida em  taxas de transação" value="R$00,00" />
                  <InfoCard title="Receitas em taxas de saque" value="R$00,00" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoCard title="Receita líquida em taxas de saque" value="R$00,00" />
                  <InfoCard title="Receita líquida total" value="R$00,00" />
                </div>
              </div>
            </div>
          </div>

          {showConfirmBalance && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-[420px] rounded-[10px] border border-foreground/15 bg-card/95 p-5 shadow-xl">
                <div className="flex items-start justify-between">
                  <p className="text-base font-semibold text-foreground">Tem certeza que deseja alterar o saldo?</p>
                  <button type="button" onClick={() => setShowConfirmBalance(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBalance(false)}
                    className="flex-1 rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm font-semibold text-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmBalance(false)}
                    className="flex-1 rounded-[8px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "indicacoes") {
      const indicados = [
        { id: "ind-1", nome: "Nome", data: "dd/mm/aaaa", faturamento: "R$0,00" },
        { id: "ind-2", nome: "Nome", data: "dd/mm/aaaa", faturamento: "R$0,00" },
        { id: "ind-3", nome: "Nome", data: "dd/mm/aaaa", faturamento: "R$0,00" }
      ];

      return (
        <div className={`${surface} p-5 sm:p-6`}>
          <p className="text-xl font-semibold text-foreground">Indicações</p>

          <div className="mt-6 space-y-5">
            <div className="rounded-[10px] border border-foreground/12 bg-card/60 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2">
                  <p className="text-xl font-semibold text-foreground">Taxas de indicação</p>
                  <Input
                    placeholder="0,00%"
                    className="h-[46px] w-full max-w-[320px] rounded-[8px] border border-foreground/15 bg-card/30 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  type="button"
                  className="mt-1 inline-flex h-[46px] items-center justify-center rounded-[8px] bg-gradient-to-r from-purple-500 to-violet-600 px-6 text-sm font-semibold text-white shadow"
                >
                  Atualizar
                </button>
              </div>
            </div>

            <div className="rounded-[10px] border border-foreground/12 bg-card/60 p-5 sm:p-6">
              <p className="text-xl font-semibold text-foreground">Usuários indicados por xxxxxx</p>
              <div className="mt-4 overflow-hidden rounded-[8px] border border-foreground/10">
                <div className="grid grid-cols-3 bg-card/40 px-4 py-3 text-sm font-semibold text-muted-foreground">
                  <span>Nome</span>
                  <span>Data da indicação</span>
                  <span>Faturamento</span>
                </div>
                <div className="divide-y divide-foreground/10">
                  {indicados.map(item => (
                    <div key={item.id} className="grid grid-cols-3 px-4 py-3 text-sm text-muted-foreground">
                      <span className="text-foreground">{item.nome}</span>
                      <span>{item.data}</span>
                      <span>{item.faturamento}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "acoes") {
      const actions = [
        { id: "bloquear", label: "Bloquear usuário", icon: <Ban className="h-4 w-4" aria-hidden /> },
        { id: "contato", label: "Entrar em contato", icon: <PhoneCall className="h-4 w-4" aria-hidden /> },
        { id: "reset", label: "Redefinir senha", icon: <KeyRound className="h-4 w-4" aria-hidden /> },
        { id: "login", label: "Fazer login", icon: <LogIn className="h-4 w-4" aria-hidden /> }
      ];

      return (
        <div className={`${surface} p-5 sm:p-6`}>
          <p className="text-xl font-semibold text-foreground">Ações</p>
          <div className="mt-6 rounded-[10px] border border-foreground/12 bg-card/60 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              {actions.map(action => (
                <button
                  key={action.id}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-[8px] border border-foreground/15 bg-card/40 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-foreground/30"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`${surface} p-5 sm:p-6`}>
        <p className="text-sm text-muted-foreground">Conteúdo disponível em breve.</p>
      </div>
    );
  };

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-6 px-4 py-6 lg:px-6">
          <Link href="/admin/usuarios" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Voltar para usuários
          </Link>

          <div className={`${surface} p-5 sm:p-6`}>
            <p className="text-lg font-semibold text-muted-foreground">Dados do usuário</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Nome do usuário</span>
                <p className="text-xl font-semibold text-foreground">{displayUser.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Documento</span>
                <p className="text-xl font-semibold text-foreground">{displayUser.document}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Razão social</span>
                <p className="text-xl font-semibold text-foreground">{displayUser.razao}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Tipo de conta</span>
                <p className="text-xl font-semibold text-foreground">{displayUser.tipoConta}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Data de criação</span>
                <p className="text-xl font-semibold text-foreground">
                  {displayUser.dataCriacao} <span className="text-xs text-muted-foreground">{displayUser.horaCriacao}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {tabs.map(tab => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-[8px] border px-3 py-3 text-sm font-semibold transition",
                    isActive
                      ? "border-primary text-primary"
                      : "border-foreground/15 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="h-10 w-10 rounded-[8px] border border-foreground/10 bg-foreground/5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
}
