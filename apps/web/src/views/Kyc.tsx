'use client';

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import mockData from "@/data/mockData.json";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shared/ui/select";
import { cn } from "@/lib/utils";
import { kycApi } from "@/lib/api";
import type { ApiError, KycPayload } from "@/lib/api-types";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/shared/ui/notification-toast";

type Step = "dados" | "documentos";

type DocumentType =
  | "document_front"
  | "document_back"
  | "selfie_with_document"
  | "document_card"
  | "proof_of_residence";

type DocumentSlot = {
  id: string;
  title: string;
  documentType: DocumentType;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const pjDocumentSlots: DocumentSlot[] = [
  { id: "doc-front", title: "Frente do documento", documentType: "document_front" },
  { id: "doc-back", title: "Verso do documento", documentType: "document_back" },
  { id: "selfie", title: "Selfie segurando o documento", documentType: "selfie_with_document" },
  { id: "cnpj-card", title: "Cartão CNPJ", documentType: "document_card" },
  { id: "comprovante-res", title: "Comprovante de residência", documentType: "proof_of_residence" }
];

const infoFields = [
  { id: "telefone", label: "Telefone", placeholder: "Insira o Telefone", colSpan: 2 },
  { id: "cep", label: "CEP", placeholder: "Insira o CEP", colSpan: 2 },
  { id: "rua", label: "Rua", placeholder: "Insira o endereço", colSpan: 2 },
  { id: "numero", label: "Número", placeholder: "Número" },
  { id: "complemento", label: "Complemento", placeholder: "Complemento" },
  { id: "estado", label: "Estado", placeholder: "Insira o estado", colSpan: 2 },
  { id: "cidade", label: "Cidade", placeholder: "Cidade" },
  { id: "bairro", label: "Bairro", placeholder: "Bairro" },
  { id: "faturamento", label: "Faturamento médio", placeholder: "Faturamento médio" },
  { id: "ticket", label: "Ticket médio", placeholder: "Ticket médio" },
  { id: "link", label: "Página de vendas", placeholder: "Insira o link", colSpan: 2 }
];
const pfSpecificFields = [
  { id: "nomeCompleto", label: "Nome completo", placeholder: "Nome completo" },
  { id: "cpf", label: "CPF", placeholder: "XXX.XXX.XXX-XX" }
];
const pjPrimaryPair = [
  { id: "cnpj", label: "CNPJ", placeholder: "XX.XXX.XXX/XXXX-XX" },
  { id: "razao", label: "Razão social", placeholder: "Razão social" }
];
const pjRemainingFields = [
  { id: "representante", label: "Nome do representante legal", placeholder: "Insira o nome", colSpan: 2 },
  { id: "cpfRepresentante", label: "CPF do representante legal", placeholder: "XXX.XXX.XXX-XX", colSpan: 2 }
];

const pfDocumentSlots: DocumentSlot[] = [
  { id: "doc-front", title: "Frente do documento", documentType: "document_front" },
  { id: "doc-back", title: "Verso do documento", documentType: "document_back" },
  { id: "selfie", title: "Selfie segurando o documento", documentType: "selfie_with_document" },
  { id: "comprovante-res", title: "Comprovante de residência", documentType: "proof_of_residence" }
];

export default function KycView() {
  const { user, token } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("dados");
  const [accountType, setAccountType] = useState("pj");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<DocumentType, File | null>>({
    document_front: null,
    document_back: null,
    selfie_with_document: null,
    document_card: null,
    proof_of_residence: null
  });
  const [isSendingForm, setIsSendingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const resolvedToken = useMemo(
    () => token ?? (typeof window !== "undefined" ? localStorage.getItem("authToken") : null),
    [token]
  );
  const [prefilled, setPrefilled] = useState(false);

  const displayName =
    user?.username || user?.fullName || user?.email || mockData.user.name;
  const userLocation = user?.accessType || mockData.user.location;
  const fullWidthIdsForPJ = useMemo(
    () => new Set(["representante", "telefone", "cep", "rua", "estado", "link"]),
    []
  );
  const isPessoaFisica = accountType === "pf";
  const responsiveFieldHeight = "max-h-[60px]";
  const limitedWidth = "2xl:w-[396px]";
  const formFields = useMemo(() => {
    const extra = isPessoaFisica ? [] : pjRemainingFields;
    return [...extra, ...infoFields];
  }, [isPessoaFisica]);
  const activeDocumentSlots = useMemo(
    () => (isPessoaFisica ? pfDocumentSlots : pjDocumentSlots),
    [isPessoaFisica]
  );
  const documentsGridClass = isPessoaFisica ? "grid gap-4 sm:grid-cols-2" : "grid gap-5 sm:grid-cols-2";

  const requiredFields = useMemo(() => {
    const base = ["telefone", "cep", "rua", "numero", "estado", "cidade", "bairro", "faturamento", "ticket"];
    if (isPessoaFisica) {
      return ["nomeCompleto", "cpf", ...base];
    }
    return ["cnpj", "razao", "representante", "cpfRepresentante", ...base];
  }, [isPessoaFisica]);

  const isFieldValid = useCallback(
    (fieldId: string) => {
      const value = formValues[fieldId] ?? "";
      if (["cpf", "cnpj", "cpfRepresentante", "telefone", "cep", "numero"].includes(fieldId)) {
        return value.replace(/\D/g, "").length > 0;
      }
      if (["faturamento", "ticket"].includes(fieldId)) {
        return value.replace(/\D/g, "").length > 0;
      }
      return value.trim().length > 0;
    },
    [formValues]
  );

  const missingFields = useMemo(
    () => requiredFields.filter(field => !isFieldValid(field)),
    [requiredFields, isFieldValid]
  );
  const isFormComplete = missingFields.length === 0;

  useEffect(() => {
    setSelectedFiles(prev => {
      const allowed = new Set(activeDocumentSlots.map(slot => slot.documentType));
      const allTypes: DocumentType[] = [
        "document_front",
        "document_back",
        "selfie_with_document",
        "document_card",
        "proof_of_residence"
      ];
      const next = { ...prev } as Record<DocumentType, File | null>;
      allTypes.forEach(type => {
        next[type] = allowed.has(type) ? prev[type] ?? null : null;
      });
      return next;
    });
  }, [activeDocumentSlots]);

  const handleNext = () => {
    if (!isFormComplete) {
      setFormError("Preencha todas as informações para avançar.");
      notify.warning("Informações incompletas", "Preencha todos os campos obrigatórios antes de avançar.");
      return;
    }
    setFormError(null);
    setCurrentStep("documentos");
  };
  const handleBack = () => setCurrentStep("dados");
  const formatDigits = (value: string) => value.replace(/\D/g, "");

  const formatCPF = (value: string) => {
    const digits = formatDigits(value).slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatCNPJ = (value: string) => {
    const digits = formatDigits(value).slice(0, 14);
    return digits
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,4})/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  const formatCEP = (value: string) => {
    const digits = formatDigits(value).slice(0, 8);
    return digits.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
  };

  const formatCurrencyBRL = (value: string) => {
    const digits = formatDigits(value);
    if (!digits) return "";
    const number = Number(digits) / 100;
    return currencyFormatter.format(number).replace(/\u00a0/g, " ");
  };

  const handleInputChange = (id: string, value: string) => {
    let formatted = value;
    if (id === "cpf" || id === "cpfRepresentante") {
      formatted = formatCPF(value);
    } else if (id === "cnpj") {
      formatted = formatCNPJ(value);
    } else if (id === "cep") {
      formatted = formatCEP(value);
    } else if (id === "faturamento" || id === "ticket") {
      formatted = formatCurrencyBRL(value);
    }
    setFormValues(prev => ({ ...prev, [id]: formatted }));
    setFormError(null);
  };

  const extractDigits = (value?: string) => (value ?? "").replace(/\D/g, "");
  const parseNumberString = (value?: string) => {
    const digits = extractDigits(value);
    return digits ? String(Number(digits)) : "";
  };

  const buildKycPayload = (): KycPayload => {
    const isPF = accountType === "pf";
    const documentNumber = isPF ? formValues.cpf : formValues.cnpj;
    const socialName = isPF ? formValues.nomeCompleto : formValues.razao;
    const ownerName = isPF ? formValues.nomeCompleto : formValues.representante;
    const kycAddress = {
      address: (formValues.rua ?? "").trim(),
      number: (formValues.numero ?? "").trim(),
      complement: (formValues.complemento ?? "").trim(),
      state: (formValues.estado ?? "").trim(),
      city: (formValues.cidade ?? "").trim(),
      neighborhood: (formValues.bairro ?? "").trim()
    };

    return {
      account_type: isPF ? "CPF" : "CNPJ",
      document: extractDigits(documentNumber),
      social_name: (socialName ?? "").trim(),
      phone: extractDigits(formValues.telefone),
      owner_name: (ownerName ?? "").trim(),
      medium_ticket: parseNumberString(formValues.ticket),
      average_revenue: parseNumberString(formValues.faturamento),
      address: kycAddress,
      kycAddress
    };
  };

  useEffect(() => {
    const loadExistingKyc = async () => {
      if (!resolvedToken || prefilled) return;
      try {
        const data = await kycApi.get(resolvedToken);
        if (!data) return;
        console.log("[KYC] Dados existentes carregados:", data);
        const isPF = (data.account_type ?? "").toUpperCase() !== "CNPJ";
        setAccountType(isPF ? "pf" : "pj");
        setFormValues(prev => ({
          ...prev,
          telefone: data.phone ?? "",
          faturamento: data.average_revenue ?? "",
          ticket: data.medium_ticket ?? "",
          link: prev.link ?? "",
          nomeCompleto: isPF ? data.owner_name ?? data.social_name ?? "" : prev.nomeCompleto ?? "",
          cpf: isPF ? data.document ?? "" : prev.cpf ?? "",
          cnpj: !isPF ? data.document ?? "" : prev.cnpj ?? "",
          razao: !isPF ? data.social_name ?? "" : prev.razao ?? "",
          representante: !isPF ? data.owner_name ?? "" : prev.representante ?? "",
          rua: data.address?.address ?? "",
          numero: data.address?.number ?? "",
          complemento: data.address?.complement ?? "",
          estado: data.address?.state ?? "",
          cidade: data.address?.city ?? "",
          bairro: data.address?.neighborhood ?? "",
        }));
        setCurrentStep("documentos");
        setPrefilled(true);
      } catch (error) {
        console.warn("[KYC] Falha ao carregar KYC existente", error);
      }
    };
    void loadExistingKyc();
  }, [resolvedToken, prefilled]);

  const handleFileChange = (documentType: DocumentType, file: File | null) => {
    setSelectedFiles(prev => ({ ...prev, [documentType]: file }));
  };

  const missingDocuments = useMemo(
    () => activeDocumentSlots.filter(slot => !selectedFiles[slot.documentType]),
    [activeDocumentSlots, selectedFiles]
  );

  const handleSubmitDocuments = async () => {
    if (!isFormComplete) {
      setFormError("Preencha todas as informações para enviar.");
      notify.warning("Informações incompletas", "Complete os campos obrigatórios antes de enviar.");
      setCurrentStep("dados");
      return;
    }
    if (!resolvedToken) {
      notify.warning("Sessão expirada", "Faça login novamente para enviar seu cadastro.");
      return;
    }

    setIsSendingForm(true);
    try {
      const payload = buildKycPayload();
      console.log("[KYC] Enviando payload:", payload);
      const response = await kycApi.create(payload, resolvedToken);
      console.log("[KYC] Resposta do servidor:", response);

      // Envia os documentos selecionados para o endpoint dedicado
      const uploads = activeDocumentSlots
        .map(slot => {
          const file = selectedFiles[slot.documentType];
          if (!file) return null;
          console.log("[KYC] Enviando documento:", slot.documentType, "arquivo:", file.name);
          return kycApi.uploadDocument(slot.documentType, file, resolvedToken);
        })
        .filter(Boolean) as Promise<unknown>[];

      if (uploads.length) {
        await Promise.all(uploads);
        console.log("[KYC] Upload de documentos concluído");
      }

      notify.success("Dados enviados", uploads.length ? "Cadastro e documentos enviados." : "Cadastro salvo.");
    } catch (error) {
      const status = (error as ApiError | undefined)?.status;
      const data = (error as ApiError & { data?: unknown } | undefined)?.data;
      if (status === 401) {
        return;
      }
      console.error("Erro ao enviar KYC:", { error, data });
      notify.error("Erro ao enviar", "Não foi possível salvar suas informações. Tente novamente.");
    } finally {
      setIsSendingForm(false);
    }
  };

  const hasAnyInput = useMemo(
    () => Object.values(formValues).some(value => (value ?? "").trim().length > 0),
    [formValues]
  );

  const formWarning =
    formError ??
    (!isFormComplete && hasAnyInput ? "Preencha todos os campos obrigatórios para avançar." : null);

  return (
    <DashboardLayout
      userName={displayName}
      userLocation={userLocation}
      pageTitle=""
    >
      <section className="px-4 pt-4">
        <div className="mx-auto xl:max-w-[700px] 2xl:max-w-[850px] flex w-full flex-col gap-8">
          {currentStep === "dados" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold text-foreground">Completar cadastro</h1>
              <Card
                className="gap-0 border border-border/60 bg-[#0b0b0b] px-5 py-8 rounded-[8px]"
              >
                <CardContent className="space-y-4 p-0">
                  {!isPessoaFisica && (
                    <div className="grid gap-2 grid-cols-2">
                      <div className="space-y-2 h-full">
                        <Label htmlFor="accountType" className="text-sm md:text-base">Tipo de conta</Label>
                        <Select value={accountType} onValueChange={value => setAccountType(value)}>
                          <SelectTrigger
                            className={cn(
                              "flex w-full items-center justify-between rounded-[8px] border border-border/60 bg-card px-3 text-sm md:text-base",
                              responsiveFieldHeight,
                              limitedWidth
                            )}
                          >
                            <SelectValue placeholder="Pessoa jurídica" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pj">Pessoa jurídica</SelectItem>
                            <SelectItem value="mei">MEI</SelectItem>
                            <SelectItem value="pf">Pessoa física</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {isPessoaFisica && (
                    <div className="grid gap-4 md:grid-cols-2 h-full w-full">
                      <div className="space-y-2 h-full w-full">
                        <Label htmlFor="accountType" className="text-sm md:text-base">Tipo de conta</Label>
                        <Select value={accountType} onValueChange={value => setAccountType(value)}>
                          <SelectTrigger
                            className={cn(
                              "flex w-full items-center justify-between rounded-[8px] border border-border/60 bg-card px-3 text-sm md:text-base",
                              responsiveFieldHeight
                            )}
                          >
                            <SelectValue placeholder="Pessoa física" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pj">Pessoa jurídica</SelectItem>
                            <SelectItem value="mei">MEI</SelectItem>
                            <SelectItem value="pf">Pessoa física</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {pfSpecificFields.map(field => (
                        <div key={field.id} className="space-y-2">
                          <Label htmlFor={field.id} className="text-sm md:text-base">{field.label}</Label>
                          <Input
                            id={field.id}
                            placeholder={field.placeholder}
                            className={cn(
                              "rounded-[8px] w-full text-sm md:text-base",
                              responsiveFieldHeight
                            )}
                            value={formValues[field.id] ?? ""}
                            onChange={e => handleInputChange(field.id, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {!isPessoaFisica && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {pjPrimaryPair.map(field => (
                        <div key={field.id} className="space-y-2">
                          <Label htmlFor={field.id} className="text-sm md:text-base">{field.label}</Label>
                          <Input
                            id={field.id}
                            placeholder={field.placeholder}
                            className={cn(
                              "rounded-[8px] w-full text-sm md:text-base",
                              responsiveFieldHeight,
                              !isPessoaFisica
                                ? fullWidthIdsForPJ.has(field.id)
                                  ? "max-w-none"
                                  : "max-w-[433px]"
                                : ""
                            )}
                            value={formValues[field.id] ?? ""}
                            onChange={e => handleInputChange(field.id, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    {formFields.map(field => (
                      <div
                        key={field.id}
                        className={cn(
                          "space-y-2",
                          field.colSpan === 2 ? "md:col-span-2" : ""
                        )}
                      >
                        <Label htmlFor={field.id} className="text-sm md:text-base">{field.label}</Label>
                          <Input
                            id={field.id}
                            placeholder={field.placeholder}
                            className={cn(
                              "rounded-[8px] w-full text-sm md:text-base",
                              responsiveFieldHeight,
                              field.id === "cpfRepresentante"
                                ? "max-w-none"
                                : !isPessoaFisica
                                  ? fullWidthIdsForPJ.has(field.id)
                                    ? "max-w-none"
                                  : "max-w-[433px]"
                                : ""
                          )}
                            value={formValues[field.id] ?? ""}
                            onChange={e => handleInputChange(field.id, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>

                <div className="mt-8 flex flex-col items-end gap-3 border-t border-border/70 pt-6">
                  {formWarning && (
                    <p className="text-sm text-red-400">{formWarning}</p>
                  )}
                  <Button
                    type="button"
                    className="min-w-[220px] rounded-[8px] bg-gradient-to-r from-[#8a2be2] to-[#6a1bff] text-sm md:text-base font-semibold text-white hover:brightness-110 h-[44px] md:h-[49px] disabled:opacity-60"
                    disabled={!isFormComplete || isSendingForm}
                    onClick={handleNext}
                  >
                    {isSendingForm ? "Enviando..." : "Avançar"}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {currentStep === "documentos" && (
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-fit rounded-[8px] border-border/80 text-sm md:text-base"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Card className="gap-0 border border-border/60 bg-[#0b0b0b] px-4 py-5 md:px-10 md:py-8 rounded-[8px]">
                <div className="border-b border-border/70 pb-6">
                  <h1 className="text-xl font-semibold text-foreground md:text-2xl">Envio de documentação</h1>
                </div>

                <CardContent className="mt-6 space-y-6 p-0">
                  <div className={`${documentsGridClass} justify-start gap-2 sm:gap-3 md:gap-4`}>
                    {activeDocumentSlots.map(slot => (
                      <DocumentUploadCard
                        key={slot.id}
                        slot={slot}
                        file={selectedFiles[slot.documentType] ?? null}
                        onFileChange={handleFileChange}
                      />
                    ))}
                  </div>
                </CardContent>

                <div className="mt-8 flex justify-center border-t border-border/70 pt-6">
                  <Button
                    type="button"
                    className="min-w-[240px] rounded-[8px] bg-gradient-to-r from-[#8a2be2] to-[#6a1bff] text-sm md:text-base font-semibold text-white hover:brightness-110 h-[44px] md:h-[49px] disabled:opacity-60"
                    disabled={isSendingForm}
                    onClick={handleSubmitDocuments}
                  >
                    {isSendingForm ? "Enviando..." : "Enviar documentos"}
                  </Button>
                </div>
                {missingDocuments.length > 0 && (
                  <p className="pt-2 text-center text-sm text-red-400">
                    Envie todos os documentos listados para concluir.
                  </p>
                )}
              </Card>
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}

function DocumentUploadCard({
  slot,
  file,
  onFileChange
}: {
  slot: DocumentSlot;
  file: File | null;
  onFileChange: (documentType: DocumentType, file: File | null) => void;
}) {
  const inputId = `upload-${slot.id}`;
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    onFileChange(slot.documentType, nextFile);
    // Allow selecting the same file again if needed
    event.target.value = "";
  };

  return (
    <label htmlFor={inputId} className="group block h-full cursor-pointer">
      <input
        id={inputId}
        type="file"
        className="sr-only"
        accept="image/*,application/pdf"
        onChange={handleChange}
      />
      <div className="flex h-full flex-col gap-3 sm:gap-4 rounded-[8px] border border-border/60 bg-[#0f0f0f] p-2 sm:p-3 md:p-4 transition duration-150 hover:border-primary/60">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground md:text-base">{slot.title}</p>
          <p className="text-xs text-muted-foreground md:text-sm">
            {file ? file.name : "Nenhum arquivo selecionado"}
          </p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-[8px] border border-border/60 bg-[#0b0b0b] px-2 sm:px-3 py-5 sm:py-6 md:py-8 text-center">
          <p className="text-sm font-semibold text-primary md:text-base">Selecione do seu dispositivo</p>
          <p className="text-xs text-muted-foreground md:text-sm">ou solte arquivos aqui</p>
          <p className="text-xs text-muted-foreground md:text-sm">Você pode inserir arquivos em: png, jpeg ou pdf</p>
        </div>
      </div>
    </label>
  );
}
