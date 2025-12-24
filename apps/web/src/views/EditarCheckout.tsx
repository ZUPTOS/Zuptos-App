'use client';

import Image from "next/image";
import { useMemo, useState, useRef, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { productApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import CheckoutPreview from "@/components/CheckoutPreview";
import type { CheckoutPayload, Product } from "@/lib/api";

const fieldClass =
  "h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const SectionCard = ({
  children,
  title,
  subtitle,
  iconSrc,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  iconSrc?: string;
}) => (
  <div className="space-y-3 rounded-[12px] border border-foreground/15 bg-card/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {iconSrc && (
          <div className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-foreground/5">
            <Image src={iconSrc} alt={title} width={16} height={16} className="h-4 w-4 object-contain" />
          </div>
        )}
        <p className="text-base font-semibold text-foreground">{title}</p>
      </div>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default function EditarCheckoutView() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const productId = useMemo(() => params?.id ?? searchParams?.get("id") ?? localStorage.getItem("lastProductId") ?? "", [params, searchParams]);
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [checkoutName, setCheckoutName] = useState("Checkout");
  const [requiredAddress, setRequiredAddress] = useState(false);
  const [requiredPhone, setRequiredPhone] = useState(false);
  const [requiredBirthdate, setRequiredBirthdate] = useState(false);
  const [requiredDocument, setRequiredDocument] = useState(false);
  const [requiredEmailConfirmation, setRequiredEmailConfirmation] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<"Light" | "Dark">("Light");
  const [counterBgColor, setCounterBgColor] = useState("#FFFFFF");
  const [counterTextColor, setCounterTextColor] = useState("#FFFFFF");
  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [accentColor, setAccentColor] = useState("#18a64a");
  const [couponEnabled, setCouponEnabled] = useState(false);
  const [salesNotificationsEnabled, setSalesNotificationsEnabled] = useState(false);
  const [socialProofEnabled, setSocialProofEnabled] = useState(false);
  const [reviewsEnabled, setReviewsEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !token) return;
      try {
        const data = await productApi.getProductById(productId, token);
        setProduct(data);
      } catch (error) {
        console.error("Erro ao carregar produto do checkout:", error);
      }
    };
    void fetchProduct();
  }, [productId, token]);

  const handleSave = async () => {
    if (!productId || !token) return;
    const payload: CheckoutPayload = {
      name: checkoutName.trim() || "Checkout",
      template: "default",
      theme,
    };
    if (requiredAddress) payload.required_address = true;
    if (requiredPhone) payload.required_phone = true;
    if (requiredBirthdate) payload.required_birthdate = true;
    if (requiredDocument) payload.required_document = true;
    if (requiredEmailConfirmation) payload.required_email_confirmation = true;
    if (countdownEnabled) {
      payload.countdown = true;
      payload["countdown active"] = true;
      payload.countdown_background = counterBgColor;
    }
    if (showLogo && logoFile) payload.logo = URL.createObjectURL(logoFile);
    if (showBanner && bannerFile) payload.banner = URL.createObjectURL(bannerFile);

    setIsSaving(true);
    try {
      console.log("[checkout] Payload enviado:", payload);
      const response = await productApi.createCheckout(productId, payload, token);
      console.log("[checkout] Resposta do servidor:", response);
    } catch (error) {
      console.error("Erro ao salvar checkout:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full px-4 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    productId
                      ? `/editar-produto/${encodeURIComponent(productId)}/checkouts`
                      : "/editar-produto"
                  )
                }
                className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
              >
                ← Voltar
              </button>
            </div>

            <div className="flex flex-col gap-4 rounded-[12px] border border-foreground/10 bg-card/80 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="overflow-hidden rounded-[10px] bg-foreground/10">
                  <Image
                    src={product?.image_url || "/images/produto.png"}
                    alt={product?.name || "Produto"}
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">{product?.name ?? "-----"}</p>
                  <p className="text-xs font-semibold text-emerald-400">{product?.status ?? "-----"}</p>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">
                  {product?.total_invoiced !== undefined
                    ? `${currencyFormatter.format(Number(product.total_invoiced))} faturados`
                    : "R$ ----- faturados"}
                </p>
                <p>
                  {product?.total_sold !== undefined ? `${product.total_sold} vendas realizadas` : "-- vendas realizadas"}
                </p>
              </div>
            </div>

            <h1 className="text-xl font-semibold text-foreground">Editar Checkout</h1>

            <div className="flex flex-col gap-6 overflow-y-auto pb-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,370px)_1fr]">
                <div className="space-y-4">
                  <SectionCard title="Nome">
                    <input
                      className={fieldClass}
                      placeholder="Digite um nome"
                      value={checkoutName}
                      onChange={event => setCheckoutName(event.target.value)}
                    />
                  </SectionCard>

                  <SectionCard title="Campos obrigatórios no Checkout" iconSrc="/images/editar-produtos/warning.svg">
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground">Itens Obrigatórios</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setRequiredAddress(prev => !prev)}
                          className={`rounded-[6px] px-3 py-2 text-[11px] font-semibold ${requiredAddress ? "bg-primary text-primary-foreground" : "border border-foreground/20 bg-card text-foreground"}`}
                        >
                          Endereço
                        </button>
                        <button
                          type="button"
                          onClick={() => setRequiredPhone(prev => !prev)}
                          className={`rounded-[6px] px-3 py-2 text-[11px] font-semibold ${requiredPhone ? "bg-primary text-primary-foreground" : "border border-foreground/20 bg-card text-foreground"}`}
                        >
                          Telefone
                        </button>
                        <button
                          type="button"
                          onClick={() => setRequiredBirthdate(prev => !prev)}
                          className={`rounded-[6px] px-3 py-2 text-[11px] font-semibold ${requiredBirthdate ? "bg-primary text-primary-foreground" : "border border-foreground/20 bg-card text-foreground"}`}
                        >
                          Data de nascimento
                        </button>
                        <button
                          type="button"
                          onClick={() => setRequiredDocument(prev => !prev)}
                          className={`rounded-[6px] px-3 py-2 text-[11px] font-semibold ${requiredDocument ? "bg-primary text-primary-foreground" : "border border-foreground/20 bg-card text-foreground"}`}
                        >
                          CPF
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                      <span>Confirmação de email</span>
                      <button
                        type="button"
                        className={`relative inline-flex h-5 w-10 items-center rounded-full ${requiredEmailConfirmation ? "bg-primary/70" : "bg-muted"}`}
                        onClick={() => setRequiredEmailConfirmation(prev => !prev)}
                      >
                        <span className={`absolute h-4 w-4 rounded-full bg-white transition ${requiredEmailConfirmation ? "left-[calc(100%-18px)]" : "left-[6px]"}`} />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O usuário será condicionado a reportar o email informado em um campo específico para sua confirmação.
                    </p>
                  </SectionCard>

                  <SectionCard title="Visual" iconSrc="/images/editar-produtos/visual.svg">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                        <span>Logotipo</span>
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${showLogo ? "bg-primary/70" : "bg-muted"}`}
                          onClick={() => setShowLogo(prev => !prev)}
                        >
                          <span className={`absolute h-4 w-4 rounded-full bg-white transition ${showLogo ? "left-[calc(100%-18px)]" : "left-[6px]"}`} />
                        </button>
                      </div>
                      {showLogo && (
                        <>
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={event => setLogoFile(event.target.files?.[0] ?? null)}
                          />
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="flex w-full items-center justify-center gap-1 rounded-[12px] border border-foreground/20 bg-card/50 px-4 py-6 text-base font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
                          >
                            <span>Arraste a imagem ou</span>
                            <span className="underline">clique aqui</span>
                          </button>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Aceitamos os formatos .jpg, .jpeg e .png com menos de 10mb.</p>
                          <p>Sugestão de tamanho: 300 X 300</p>
                        </div>
                      </>
                    )}
                      <input className={fieldClass} placeholder="Posicionamento" />
                      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                        <span>Banner</span>
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${showBanner ? "bg-primary/70" : "bg-muted"}`}
                          onClick={() => setShowBanner(prev => !prev)}
                        >
                          <span className={`absolute h-4 w-4 rounded-full bg-white transition ${showBanner ? "left-[calc(100%-18px)]" : "left-[6px]"}`} />
                        </button>
                      </div>
                      {showBanner && (
                        <>
                          <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={event => setBannerFile(event.target.files?.[0] ?? null)}
                          />
                          <button
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            className="flex w-full items-center justify-center gap-1 rounded-[12px] border border-foreground/20 bg-card/50 px-4 py-6 text-base font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
                          >
                            Arraste a imagem ou <span className="underline">clique aqui</span>
                          </button>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Aceitamos os formatos .jpg, .jpeg e .png com menos de 10mb.</p>
                            <p>Sugestão de tamanho: 300 X 300</p>
                          </div>
                        </>
                      )}
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-foreground">Plano de Fundo</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setTheme("Light")}
                            className={`rounded-[10px] border px-3 py-4 text-sm font-semibold shadow-inner ${
                              theme === "Light" ? "border-foreground/20 bg-[#d9d9d9] text-black" : "border-foreground/20 bg-card text-foreground"
                            }`}
                            type="button"
                          >
                            Claro
                          </button>
                          <button
                            onClick={() => setTheme("Dark")}
                            className={`rounded-[10px] border px-3 py-4 text-sm font-semibold ${
                              theme === "Dark" ? "border-foreground/20 bg-[#232323] text-foreground" : "border-foreground/20 bg-card text-foreground"
                            }`}
                            type="button"
                          >
                            Escuro
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                          <span>Contador regressivo</span>
                          <button
                            type="button"
                            className={`relative inline-flex h-5 w-10 items-center rounded-full ${countdownEnabled ? "bg-primary/70" : "bg-muted"}`}
                            onClick={() => setCountdownEnabled(prev => !prev)}
                          >
                            <span className={`absolute h-4 w-4 rounded-full bg-white transition ${countdownEnabled ? "left-[calc(100%-18px)]" : "left-[6px]"}`} />
                          </button>
                        </div>
                        {!countdownEnabled && (
                          <p className="text-xs text-muted-foreground">
                            Ative para exibir a tarja superior e a barra de progresso na pré-visualização.
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-foreground">Cores de destaque</p>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { color: "#000000", label: "Clean (padrão)" },
                            { color: "#5f17ff", label: "Clean (padrão)" },
                            { color: "#d000ff", label: "Clean (padrão)" },
                            { color: "#007c35", label: "Clean (padrão)" },
                            { color: "#c7a100", label: "Clean (padrão)" },
                          ].map(option => (
                            <div key={option.color} className="space-y-1 rounded-[10px] border border-foreground/15 bg-card p-2 text-center">
                              <button
                                className="h-10 w-full rounded-[8px]"
                                style={{ backgroundColor: option.color }}
                                aria-label={option.label}
                                onClick={() => setAccentColor(option.color)}
                              />
                              <p className="text-[11px] text-foreground">{option.label}</p>
                            </div>
                          ))}
                          <div className="space-y-1 rounded-[10px] border border-foreground/15 bg-card p-2 text-center">
                            <input
                              type="color"
                              className="h-10 w-full cursor-pointer rounded-[8px] border border-foreground/20 bg-card"
                              aria-label="Personalizado"
                              defaultValue="#6C27D7"
                              onChange={event => setAccentColor(event.target.value)}
                            />
                            <p className="text-[11px] text-foreground">Personalizado</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>

                <div className="space-y-4">
                  <SectionCard title="Pré-visualização">
                    <div className="flex flex-col items-center gap-3">
                    <CheckoutPreview
                      theme={theme}
                      showLogo={showLogo}
                      showBanner={showBanner}
                      requiredAddress={requiredAddress}
                      requiredPhone={requiredPhone}
                      requiredBirthdate={requiredBirthdate}
                      requiredDocument={requiredDocument}
                      countdownEnabled={countdownEnabled}
                      accentColor={accentColor}
                      counterBgColor={counterBgColor}
                      counterTextColor={counterTextColor}
                    />
                      <p className="text-xs text-muted-foreground">
                        Esta pré-visualização reflete as opções ativadas acima (logo, banner, campos obrigatórios, tema).
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm text-foreground">
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] disabled:opacity-60"
                      >
                        {isSaving ? "Salvando..." : "Salvar alterações"}
                      </button>
                    </div>
                  </SectionCard>
                </div>
              </div>

              <div className="space-y-4 w-full max-w-[370px]">
                <SectionCard title="Pagamentos" iconSrc="/images/editar-produtos/pagamentos.svg">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">Aceitar pagamentos de</p>
                    <div className="flex gap-2">
                      {["CPF", "CNPJ"].map(doc => (
                        <button key={doc} className="rounded-[8px] border border-foreground/20 bg-card px-3 py-2 text-xs text-foreground">
                          {doc}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-foreground">Métodos aceitos</p>
                    <div className="flex gap-2">
                      {["Cartão de crédito", "Boleto", "Pix"].map(method => (
                        <button key={method} className="rounded-[8px] border border-foreground/20 bg-card px-3 py-2 text-xs text-foreground">
                          {method}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold text-foreground pt-2">
                      <span>Cupom de desconto</span>
                      <button
                        type="button"
                        className={`relative inline-flex h-5 w-10 items-center rounded-full ${couponEnabled ? "bg-primary/70" : "bg-muted"}`}
                        onClick={() => setCouponEnabled(prev => !prev)}
                      >
                        <span className={`absolute h-4 w-4 rounded-full bg-white transition ${couponEnabled ? "left-[calc(100%-18px)]" : "left-[6px]"}`} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input className={fieldClass} placeholder="Cartão de crédito" />
                      <input className={fieldClass} placeholder="Pix" />
                    </div>
                    <input className={fieldClass} placeholder="Boleto" />
                    <div className="grid grid-cols-2 gap-3">
                      <input className={fieldClass} placeholder="Limite de parcelas" />
                      <input className={fieldClass} placeholder="Parcela pré-selecionada" />
                    </div>
                    <input className={fieldClass} placeholder="Dias para vencimento" />
                    <input className={fieldClass} placeholder="Tempo de expiração (Pix)" />
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Preferências</p>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4 rounded border border-foreground/30 bg-card" />
                          Mostrar nomes de vendedores no modelo
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4 rounded border border-foreground/30 bg-card" />
                          Solicitar endereço do comprador
                        </label>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Gatilhos e Depoimentos" iconSrc="/images/editar-produtos/gatilhos.svg">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[15px] font-semibold text-foreground">
                        <span>Contador Regressivo</span>
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${countdownEnabled ? "bg-primary/70" : "bg-muted"}`}
                          onClick={() => setCountdownEnabled(prev => !prev)}
                        >
                          <span className={`absolute h-4 w-4 rounded-full bg-white transition ${countdownEnabled ? "left-[calc(100%-18px)]" : "left-[6px]"}`} />
                        </button>
                      </div>

                      {countdownEnabled && (
                        <>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <span>Texto de mensagem ativa</span>
                            <textarea
                              className="min-h-[72px] w-full rounded-[10px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                              placeholder="Seu tempo acabou! Finalize a compra imediatamente."
                            />
                          </div>

                          <div className="space-y-2 text-sm text-muted-foreground">
                            <span>Texto da contagem zerada</span>
                            <textarea
                              className="min-h-[72px] w-full rounded-[10px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                              placeholder="Seu tempo acabou! Finalize a compra imediatamente."
                            />
                          </div>

                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-foreground">Cor do fundo do contador</p>
                            <div className="flex items-center gap-2">
                              <input
                                className="h-11 flex-1 rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                                placeholder="#FFFFFF"
                                value={counterBgColor}
                                onChange={e => setCounterBgColor(e.target.value)}
                              />
                              <button
                                className="h-11 w-16 rounded-[10px] border border-foreground/15"
                                style={{ backgroundColor: counterBgColor }}
                                aria-label="Selecionar cor de fundo"
                                type="button"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-foreground">Cor do Texto do contador</p>
                            <div className="flex items-center gap-2">
                              <input
                                className="h-11 flex-1 rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                                placeholder="#FFFFFF"
                                value={counterTextColor}
                                onChange={e => setCounterTextColor(e.target.value)}
                              />
                              <button
                                className="h-11 w-16 rounded-[10px] border border-foreground/15"
                                style={{ backgroundColor: counterTextColor }}
                                aria-label="Selecionar cor do texto"
                                type="button"
                              />
                            </div>
                          </div>
                        </>
                      )}

                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                        <span>Notificações de vendas</span>
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${salesNotificationsEnabled ? "bg-primary/70" : "bg-muted"}`}
                          onClick={() => setSalesNotificationsEnabled(prev => !prev)}
                        >
                          <span className={`absolute h-4 w-4 rounded-full bg-white transition ${salesNotificationsEnabled ? "left-[calc(100%-18px)]" : "left-[6px]"}`} />
                        </button>
                      </div>
                      {salesNotificationsEnabled && (
                        <input className="h-11 w-full rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-muted-foreground focus:border-primary focus:outline-none" placeholder="15 segundos" />
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between text-sm text-foreground">
                        <span>Configure as notificações</span>
                        <span className="text-[11px] text-muted-foreground">Qnt mínima</span>
                      </div>
                      {[
                        "XX pessoas estão comprando o produto.",
                        "XX pessoas compraram o produto agora mesmo.",
                        "XX pessoas compraram o produto nos últimos 30 minutos.",
                        "XX pessoas compraram o produto na última hora.",
                      ].map(label => (
                        <label key={label} className="flex items-center justify-between gap-3 text-foreground">
                          <span className="flex-1 text-xs text-muted-foreground">{label}</span>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="h-4 w-4 rounded border border-foreground/30 bg-card" />
                            <input className="h-9 w-12 rounded-[8px] border border-foreground/20 bg-card px-2 text-xs text-foreground focus:outline-none" placeholder="1" />
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                        <span>Prova Social</span>
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${socialProofEnabled ? "bg-primary/70" : "bg-muted"}`}
                          onClick={() => setSocialProofEnabled(prev => !prev)}
                        >
                          <span className={`absolute h-4 w-4 rounded-full bg-white transition ${socialProofEnabled ? "left-[calc(100%-18px)]" : "left-[6px]"}`} />
                        </button>
                      </div>
                      {socialProofEnabled && (
                        <textarea
                          className="min-h-[70px] w-full rounded-[10px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Outras ( num-visitantes ) visitantes estão finalizando a compra neste momento."
                        />
                      )}
                    </div>

                    <div className="space-y-2 pt-2">
                      <p className="text-sm font-semibold text-foreground">Mínimo de visitantes</p>
                      <input
                        className="h-11 w-full rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="15 visitantes"
                      />
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] bg-foreground/5">
                          ⭐
                        </span>
                        <p>Depoimentos/Reviews</p>
                        <button
                          type="button"
                          className={`relative ml-auto inline-flex h-5 w-10 items-center rounded-full ${reviewsEnabled ? "bg-primary/70" : "bg-muted"}`}
                          onClick={() => setReviewsEnabled(prev => !prev)}
                        >
                          <span className={`absolute h-4 w-4 rounded-full bg-white transition ${reviewsEnabled ? "left-[calc(100%-18px)]" : "left-[6px]"}`} />
                        </button>
                      </div>
                      {reviewsEnabled && (
                        <>
                          <p className="text-xs text-muted-foreground">
                            Com os reviews, você cria argumentos de confiança para seu cliente finalizar a compra.
                          </p>
                          {[1, 2].map(idx => (
                            <div key={idx} className="space-y-2 rounded-[10px] border border-foreground/15 bg-card p-3">
                              <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-semibold text-foreground">#{idx}</span>
                                  <div className="flex items-center gap-2">
                                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                                    </button>
                                    <span className="text-xs text-foreground">Ativo</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button className="rounded-[6px] border border-foreground/20 bg-card px-2 py-1 text-xs text-foreground">
                                    Editar
                                  </button>
                                  <button className="rounded-[6px] border border-foreground/20 bg-card px-2 py-1 text-xs text-rose-300">
                                    Excluir
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/70" />
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-foreground">Nome e sobrenome</p>
                                  <div className="flex gap-1 text-[#8ea000]">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <span key={i}>★</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard
                                dummy text ever since the 1500s,
                              </p>
                            </div>
                          ))}
                          <div className="space-y-3 rounded-[10px] border border-foreground/15 bg-card p-3">
                            <p className="text-sm font-semibold text-foreground">#2</p>
                            <div className="rounded-[8px] border border-dashed border-foreground/20 bg-card/50 px-3 py-4 text-xs text-muted-foreground text-center">
                              Arraste a imagem ou clique aqui
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">
                                Aceitamos os formatos .jpg, .jpeg e .png com menos de 10mb.
                                <br />
                                Sugestão de tamanho: 300 X 300
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-foreground">Classificação</p>
                              <div className="flex gap-1 text-[#8ea000]">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i}>★</span>
                                ))}
                              </div>
                            </div>
                            <input className={fieldClass} placeholder="Nome" />
                            <input className={fieldClass} placeholder="Depoimento" />
                            <button className="rounded-[8px] bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                              Inserir novo depoimento
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Pós-compra" iconSrc="/images/editar-produtos/poscompra.svg">
                  <div className="space-y-3">
                    <label className="space-y-1 text-xs text-muted-foreground">
                      <span>Título da mensagem</span>
                      <input className={fieldClass} placeholder="Agradecemos pela sua compra!" />
                    </label>
                    <label className="space-y-1 text-xs text-muted-foreground">
                      <span>Descritivo</span>
                      <textarea
                        className="min-h-[80px] w-full rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Você receberá um e-mail confirmando o seu pedido."
                      />
                    </label>
                    <div className="flex items-center justify-end gap-3">
                      <button className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm text-foreground">Cancelar</button>
                      <button className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)]">
                        Salvar alterações
                      </button>
                    </div>
                  </div>
                </SectionCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>

  );
}
