'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { productApi } from "@/lib/api";
import type { Product, ProductSettings, UpdateProductSettingsRequest } from "@/lib/api";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function ConfiguracoesTab({ productId, token, withLoading }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<ProductSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [formValues, setFormValues] = useState({
    support_email: "",
    phone_support: "",
    language: "",
    currency: "",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
  });
  const [statusDraft, setStatusDraft] = useState<"active" | "inactive">("active");

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId || !token) return;
      try {
        const data = await withLoading(
          () => productApi.getProductById(productId, token),
          "Carregando produto"
        );
        setProduct(data);
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
      }
    };
    void loadProduct();
  }, [productId, token, withLoading]);

  useEffect(() => {
    const load = async () => {
      if (!productId || !token) return;
      setLoading(true);
      setError(null);
      try {
        const data = await withLoading(
          () => productApi.getProductSettings(productId, token),
          "Carregando configurações"
        );
        setSettings(data);
        console.log("Configurações carregadas:", data);
        if (data?.status) {
          setStatusDraft(data.status === "inactive" ? "inactive" : "active");
        }
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
        setError("Não foi possível carregar as configurações agora.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [productId, token, withLoading]);

  const handleSave = async () => {
    if (!productId || !token) return;
    setSaving(true);
    setError(null);
    try {
      const payload: UpdateProductSettingsRequest = {};
      const supportEmail = formValues.support_email.trim();
      const phoneSupport = formValues.phone_support.trim();
      const language = formValues.language.trim();
      const currency = formValues.currency.trim();
      const nextName = productForm.name.trim();
      const nextDescription = productForm.description.trim();

      if (supportEmail && supportEmail !== settings?.support_email) {
        payload.support_email = supportEmail;
      }
      if (phoneSupport && phoneSupport !== settings?.phone_support) {
        payload.phone_support = phoneSupport;
      }
      if (language && language !== settings?.language) {
        payload.language = language;
      }
      if (currency && currency !== settings?.currency) {
        payload.currency = currency;
      }
      if (statusDraft && statusDraft !== settings?.status) {
        payload.status = statusDraft;
      }

      if (nextName || nextDescription) {
        payload.product = {
          id: productId,
          name: nextName || product?.name,
          description: nextDescription || product?.description,
        };
      }

      if (Object.keys(payload).length === 0) {
        setSaving(false);
        return;
      }

      const updatedSettings = await withLoading(
        () => productApi.updateProductSettings(productId, payload, token),
        "Salvando configurações"
      );
      let nextSettings = updatedSettings ?? settings;
      let nextProduct = product;

      try {
        const [freshSettings, freshProduct] = await Promise.all([
          productApi.getProductSettings(productId, token),
          productApi.getProductById(productId, token),
        ]);
        nextSettings = freshSettings ?? nextSettings;
        nextProduct = freshProduct ?? nextProduct;
      } catch (refreshError) {
        console.warn("Falha ao atualizar dados após salvar configurações:", refreshError);
      }

      if (nextSettings) {
        setSettings(nextSettings);
      }
      if (nextProduct) {
        setProduct(nextProduct);
      }
      setFormValues({
        support_email: "",
        phone_support: "",
        language: "",
        currency: "",
      });
      setProductForm({ name: "", description: "" });
      console.log("Configurações salvas com sucesso!", { payload });
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      setError("Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateProduct = async () => {
    if (!productId || !token) return;
    setSaving(true);
    setError(null);
    try {
      await withLoading(() => productApi.deleteProduct(productId, token), "Excluindo produto");
      setStatusDraft("inactive");
    } catch (err) {
      console.error("Erro ao desativar produto:", err);
      setError("Não foi possível desativar o produto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h2 className="text-lg font-semibold text-foreground">Configurações</h2>

      <div className="space-y-6 rounded-[12px] border border-foreground/10 bg-card/80 p-6 shadow-[0_14px_36px_rgba(0,0,0,0.35)]">
        <div className="grid grid-cols-[200px_1fr] items-start gap-4">
          <div className="flex items-center justify-center rounded-[12px] border border-foreground/10 bg-card/70 p-3">
            <Image
              src="/images/produto.png"
              alt="Produto"
              width={160}
              height={160}
              className="h-[160px] w-[160px] rounded-[10px] object-cover"
            />
          </div>

          <div className="space-y-3">
            <label className="space-y-1 text-sm text-muted-foreground">
              <span className="text-foreground">Nome do produto</span>
              <input
                className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder={product?.name ?? "Nome do produto"}
                value={productForm.name}
                onChange={event => setProductForm(current => ({ ...current, name: event.target.value }))}
                disabled={loading || saving}
              />
            </label>
            <label className="space-y-1 text-sm text-muted-foreground">
              <span className="text-foreground">Descrição breve</span>
              <textarea
                className="min-h-[80px] w-full rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder={product?.description ?? "Descrição do produto"}
                value={productForm.description}
                onChange={event => setProductForm(current => ({ ...current, description: event.target.value }))}
                disabled={loading || saving}
              />
            </label>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-muted-foreground">
            <span className="text-foreground">E-mail de suporte</span>
            <input
              className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              placeholder={settings?.support_email ?? "ex: suporte@empresa.com"}
              value={formValues.support_email}
              onChange={event =>
                setFormValues(current => ({ ...current, support_email: event.target.value }))
              }
              disabled={loading || saving}
            />
          </label>
          <label className="space-y-1 text-sm text-muted-foreground">
            <span className="text-foreground">Telefone de suporte</span>
            <input
              className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              placeholder={settings?.phone_support ?? "ex: +55 11 99999-9999"}
              value={formValues.phone_support}
              onChange={event =>
                setFormValues(current => ({ ...current, phone_support: event.target.value }))
              }
              disabled={loading || saving}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-muted-foreground">
            <span className="text-foreground">Idioma</span>
            <input
              className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              placeholder={settings?.language ?? "pt-BR"}
              value={formValues.language}
              onChange={event =>
                setFormValues(current => ({ ...current, language: event.target.value }))
              }
              disabled={loading || saving}
            />
          </label>
          <label className="space-y-1 text-sm text-muted-foreground">
            <span className="text-foreground">Moeda base</span>
            <input
              className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              placeholder={settings?.currency ?? "BRL"}
              value={formValues.currency}
              onChange={event =>
                setFormValues(current => ({ ...current, currency: event.target.value }))
              }
              disabled={loading || saving}
            />
          </label>
        </div>

        <div className="flex items-center justify-between rounded-[10px] border border-foreground/15 bg-card px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Status do produto</p>
            <p className="text-xs text-muted-foreground">Gerencie se o produto estará ou não ativo para vendas</p>
          </div>
          <button
            className={`relative inline-flex h-5 w-10 items-center rounded-full ${
              statusDraft === "active" ? "bg-primary/70" : "bg-muted"
            }`}
            onClick={() =>
              setStatusDraft(current => (current === "active" ? "inactive" : "active"))
            }
            disabled={loading || saving}
            type="button"
          >
            <span
              className={`absolute h-4 w-4 rounded-full bg-white transition ${
                statusDraft === "active" ? "left-[calc(100%-18px)]" : "left-[6px]"
              }`}
            />
          </button>
        </div>

        <div className="rounded-[10px] border border-foreground/15 bg-card px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Recuperação ativa</p>
              <p className="text-xs text-muted-foreground">
                Com esse recurso reconquiste o cliente que está prestes a cancelar a compra ou recupere uma venda não finalizada.
              </p>
            </div>
            <button
              className="rounded-[8px] border border-foreground/20 bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/40"
              onClick={() => setShowRecoveryModal(true)}
              type="button"
            >
              Configurar
            </button>
          </div>
        </div>

        {error && <div className="text-sm text-rose-300">{error}</div>}
      </div>

      <div className="flex items-center justify-between">
        <button
          className="rounded-[8px] border border-rose-900/60 bg-rose-900/30 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-900/50 disabled:opacity-60"
          type="button"
          onClick={handleDeactivateProduct}
          disabled={saving || loading}
        >
          Excluir produto
        </button>
        <button
          className="rounded-[8px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90 disabled:opacity-60"
          type="button"
          onClick={handleSave}
          disabled={saving || loading || !settings}
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRecoveryModal(false)}
            aria-label="Fechar modal de recuperação"
          />
          <div className="relative h-full w-full max-w-[500px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Configurar Recuperação Ativa</h2>
                <p className="text-sm text-muted-foreground">
                  Com esse recurso reconquiste o cliente que está prestes a cancelar a compra ou recupere uma venda não finalizada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-6 pb-10">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Preferências</p>

                <div className="space-y-2 rounded-[10px] border border-foreground/15 bg-card/80 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>Ofertas de preço único</span>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione um produto para ser ofertado de forma gratuita para seu cliente no momento do cancelamento de um produto de preço
                    único.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="h-11 rounded-[8px] border border-foreground/15 bg-card px-3 text-left text-sm text-muted-foreground">
                      Produto
                    </button>
                    <button className="h-11 rounded-[8px] border border-foreground/15 bg-card px-3 text-left text-sm text-muted-foreground">
                      Oferta
                    </button>
                  </div>
                </div>

                <div className="space-y-2 rounded-[10px] border border-foreground/15 bg-card/80 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>Ofertas recorrentes</span>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione uma porcentagem que será aplicada como desconto no momento do cancelamento dos seus planos recorrentes.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="20"
                    />
                    <span className="rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground">%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 rounded-[8px] border border-foreground/20 bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowRecoveryModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-[8px] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                >
                  Prosseguir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
