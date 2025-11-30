'use client';

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import mockData from "@/data/mockData.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Step = "dados" | "documentos";

type DocumentSlot = {
  id: string;
  title: string;
};

const documentSlots: DocumentSlot[] = [
  { id: "doc-front", title: "Frente do documento" },
  { id: "doc-back", title: "Verso do documento" },
  { id: "selfie", title: "Selfie segurando o documento" },
  { id: "cnpj-card", title: "Cartão Cnpj" },
  { id: "comprovante-res", title: "Comprovante de residência" },
  { id: "contrato-social", title: "Contrato social" }
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
const pfSpecificFields = [{ id: "cpf", label: "CPF", placeholder: "XXX.XXX.XXX-XX" }];
const pjPrimaryPair = [
  { id: "cnpj", label: "CNPJ", placeholder: "XX.XXX.XXX/XXXX-XX" },
  { id: "razao", label: "Razão social", placeholder: "Razão social" }
];
const pjRemainingFields = [
  { id: "representante", label: "Nome do representante legal", placeholder: "Insira o nome", colSpan: 2 },
  { id: "cpfRepresentante", label: "CPF do representante legal", placeholder: "XXX.XXX.XXX-XX", colSpan: 2 }
];

const pfDocumentSlots: DocumentSlot[] = [
  { id: "doc-front", title: "Frente do documento" },
  { id: "doc-back", title: "Verso do documento" },
  { id: "selfie", title: "Selfie segurando o documento" },
  { id: "comprovante-res", title: "Comprovante de residência" }
];

export default function KycView() {
  const [currentStep, setCurrentStep] = useState<Step>("dados");
  const [accountType, setAccountType] = useState("pj");

  const fullWidthIdsForPJ = useMemo(
    () => new Set(["representante", "telefone", "cep", "rua", "estado", "link"]),
    []
  );
  const isPessoaFisica = accountType === "pf";
  const responsiveFieldHeight = "h-[45px] sm:h-[47px] md:h-[49px]";
  const limitedWidth = "max-w-full sm:max-w-[340px] md:max-w-[433px]";
  const formFields = useMemo(
    () => [...(isPessoaFisica ? [] : pjRemainingFields), ...infoFields],
    [isPessoaFisica]
  );
  const activeDocumentSlots = isPessoaFisica ? pfDocumentSlots : documentSlots;
  const documentsGridClass = isPessoaFisica ? "grid gap-5 sm:grid-cols-2" : "grid gap-5 sm:grid-cols-2";

  const handleNext = () => setCurrentStep("documentos");
  const handleBack = () => setCurrentStep("dados");

  return (
    <DashboardLayout
      userName={mockData.user.name}
      userLocation={mockData.user.location}
      pageTitle=""
    >
      <section className="px-4 pb-10 pt-6 md:px-6">
        <div
          className="mx-auto flex w-full flex-col gap-8"
          style={{ maxWidth: "1360px" }}
        >
          {currentStep === "dados" && (
            <div className="space-y-4" style={{ width: "100%", maxWidth: "956px", marginLeft: "auto", marginRight: "auto" }}>
              <h1 className="text-xl font-semibold text-foreground md:text-2xl">Completar cadastro</h1>
              <Card
                className="gap-0 border border-border/60 bg-[#0b0b0b] px-3 py-4 sm:px-4 sm:py-5 md:px-10 md:py-8 rounded-[8px]"
              >
                <CardContent className="space-y-6 p-0">
                  {!isPessoaFisica && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="accountType" className="text-sm md:text-base">Tipo de conta</Label>
                        <Select value={accountType} onValueChange={value => setAccountType(value)}>
                          <SelectTrigger
                            className={cn(
                              "w-full justify-between rounded-[8px] text-sm md:text-base px-3 items-center",
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
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="accountType" className="text-sm md:text-base">Tipo de conta</Label>
                        <Select value={accountType} onValueChange={value => setAccountType(value)}>
                          <SelectTrigger
                            className={cn(
                              "w-full justify-between rounded-[8px] text-sm md:text-base px-3 items-center",
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

                      <div className="space-y-2">
                        <Label htmlFor={pfSpecificFields[0].id} className="text-sm md:text-base">{pfSpecificFields[0].label}</Label>
                          <Input
                            id={pfSpecificFields[0].id}
                            placeholder={pfSpecificFields[0].placeholder}
                            className={cn(
                              "rounded-[8px] w-full text-sm md:text-base",
                              responsiveFieldHeight
                            )}
                          />
                      </div>
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
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>

                <div className="mt-8 flex justify-end border-t border-border/70 pt-6">
                  <Button
                    type="button"
                    className="min-w-[220px] rounded-[8px] bg-gradient-to-r from-[#8a2be2] to-[#6a1bff] text-sm md:text-base font-semibold text-white hover:brightness-110 h-[44px] md:h-[49px]"
                    onClick={handleNext}
                  >
                    Avançar
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
                      <DocumentUploadCard key={slot.id} slot={slot} />
                    ))}
                  </div>
                </CardContent>

                <div className="mt-8 flex justify-center border-t border-border/70 pt-6">
                  <Button
                    type="button"
                    className="min-w-[240px] rounded-[8px] bg-gradient-to-r from-[#8a2be2] to-[#6a1bff] text-sm md:text-base font-semibold text-white hover:brightness-110 h-[44px] md:h-[49px]"
                  >
                    Enviar documentos
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}

function DocumentUploadCard({ slot }: { slot: DocumentSlot }) {
  const inputId = `upload-${slot.id}`;
  return (
    <label htmlFor={inputId} className="group block h-full cursor-pointer">
      <input id={inputId} type="file" className="sr-only" accept="image/*,application/pdf" />
      <div className="flex h-full flex-col gap-3 sm:gap-4 rounded-[8px] border border-border/60 bg-[#0f0f0f] p-2 sm:p-3 md:p-4 transition duration-150 hover:border-primary/60">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground md:text-base">{slot.title}</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-[8px] border border-border/60 bg-[#0b0b0b] px-2 sm:px-3 py-5 sm:py-6 md:py-8 text-center">
          <p className="text-sm font-semibold text-primary md:text-base">Selecione do seu dispositivo</p>
          <p className="text-xs text-muted-foreground md:text-sm">ou solte arquivos aqui</p>
          <p className="text-xs text-muted-foreground md:text-sm">Você pode inserir arquivos em: png ou jpeg</p>
        </div>
      </div>
    </label>
  );
}
