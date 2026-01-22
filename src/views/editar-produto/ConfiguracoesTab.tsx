'use client';

import Image from "next/image";
import { ProductSettingsCurrency, ProductSettingsLanguage, ProductSettingsStatus, ProductType } from "@/lib/api";
import { useSettings } from "./hooks/useSettings";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function ConfiguracoesTab({ productId, token, withLoading }: Props) {
  const {
    product,
    settings,
    loading,
    saving,
    error,
    showRecoveryModal,
    formValues,
    productForm,
    statusDraft,
    setShowRecoveryModal,
    setFormValues,
    setProductForm,
    setStatusDraft,
    handleSave,
    handleDeactivateProduct,
  } = useSettings({ productId, token, withLoading });

  const inputClass =
    "h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";
  const selectClass = `${inputClass} appearance-none pr-9`;
  const categoryOptions = [
    "Animais e Plantas",
    "Apps & Software",
    "Casa e Construção",
    "Culinária e Gastronomia",
    "Desenvolvimento Pessoal",
    "Direito",
    "Ecologia e Meio Ambiente",
    "Educacional",
    "Empreendedorismo Digital",
    "Entretenimento",
    "Espiritualidade",
    "Finanças e Investimentos",
    "Hobbies",
    "Idiomas",
    "Internet",
    "Literatura",
    "Moda e Beleza",
    "Música e Artes",
    "Negócios e Carreira",
    "Relacionamentos",
    "Saúde e Esportes",
    "Sexualidade",
    "Tecnologia da Informação",
    "Outros",
  ];
  const formatOptions = [
    { value: ProductType.COURSE, label: "Curso" },
    { value: ProductType.SERVICE, label: "Serviço" },
    { value: ProductType.BOOK, label: "E-book" },
  ];
  const isProductLocked = Boolean(product?.id);

  return (
    <>
      <h2 className="text-lg font-semibold text-foreground">Configurações</h2>

      <div className="space-y-6 rounded-[12px] border border-foreground/10 bg-card/80 p-6 shadow-[0_14px_36px_rgba(0,0,0,0.35)]">
        <div className="grid gap-4 md:grid-cols-[160px_1fr]">
          <div className="flex items-start justify-center">
            <div className="h-[170px] w-[170px] overflow-hidden rounded-[12px] border border-foreground/10 bg-card/70">
              <Image
                src={product?.image_url || "/images/produto.png"}
                alt={product?.name ?? "Produto"}
                width={170}
                height={170}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="space-y-1 text-sm text-muted-foreground">
              <span className="text-foreground">Nome do produto</span>
              <input
                className={inputClass}
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
            <span className="text-foreground">E-mail</span>
            <input
              className={inputClass}
              placeholder={settings?.support_email ?? "Insira o e-mail"}
              value={formValues.support_email}
              onChange={event =>
                setFormValues(current => ({ ...current, support_email: event.target.value }))
              }
              disabled={loading || saving}
            />
          </label>
          <label className="space-y-1 text-sm text-muted-foreground">
            <span className="text-foreground">Telefone</span>
            <input
              className={inputClass}
              placeholder={settings?.phone_support ?? "Insira o telefone"}
              value={formValues.phone_support}
              onChange={event =>
                setFormValues(current => ({ ...current, phone_support: event.target.value }))
              }
              disabled={loading || saving}
            />
          </label>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Preferências</p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-muted-foreground">
              <span className="text-foreground">Categoria</span>
              <div className="relative">
                <select
                  className={selectClass}
                  value={productForm.category}
                  onChange={event =>
                    setProductForm(current => ({ ...current, category: event.target.value }))
                  }
                  disabled={loading || saving}
                >
                  <option value="">{product?.category ?? "Selecione a categoria"}</option>
                  {categoryOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                  ▼
                </span>
              </div>
            </label>
            <label className="space-y-1 text-sm text-muted-foreground">
              <span className="text-foreground">Formato</span>
              <div className="relative">
                <select
                  className={selectClass}
                  value={productForm.type || (product?.type ? String(product.type) : "")}
                  onChange={event =>
                    setProductForm(current => ({ ...current, type: event.target.value }))
                  }
                  disabled={loading || saving || isProductLocked}
                >
                  <option value="">{product?.type ?? "Selecione o formato"}</option>
                  {formatOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                  ▼
                </span>
              </div>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm text-muted-foreground">
              <span className="text-foreground">Idioma</span>
              <div className="relative">
                <select
                  className={selectClass}
                  value={formValues.language}
                  onChange={event =>
                    setFormValues(current => ({ ...current, language: event.target.value }))
                  }
                  disabled={loading || saving}
                >
                  <option value="">Selecione o idioma</option>
                  <option value="pt-BR">pt-BR</option>
                  <option value="en-US">en-US</option>
                  <option value="es-ES">es-ES</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                  ▼
                </span>
              </div>
            </label>
            <label className="space-y-1 text-sm text-muted-foreground">
              <span className="text-foreground">Moeda base</span>
              <div className="relative">
                <select
                  className={selectClass}
                  value={formValues.currency || (settings?.currency ? String(settings.currency) : "")}
                  onChange={event =>
                    setFormValues(current => ({ ...current, currency: event.target.value }))
                  }
                  disabled={loading || saving || isProductLocked}
                >
                  <option value="">{settings?.currency ?? "Selecione a moeda"}</option>
                  <option value={ProductSettingsCurrency.BRL}>Real (BRL)</option>
                  <option value={ProductSettingsCurrency.USD}>Dólar (USD)</option>
                  <option value={ProductSettingsCurrency.EUR}>Euro (EUR)</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                  ▼
                </span>
              </div>
            </label>
            <label className="space-y-1 text-sm text-muted-foreground">
              <span className="text-foreground">Página de vendas</span>
              <input
                className={inputClass}
                placeholder="www.site.com"
                value={productForm.sale_url}
                onChange={event => setProductForm(current => ({ ...current, sale_url: event.target.value }))}
                disabled={loading || saving || isProductLocked}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-[10px] border border-foreground/15 bg-card px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Status do produto</p>
            <p className="text-xs text-muted-foreground">Gerencie se o produto estará ou não ativo para vendas</p>
          </div>
          <button
            className={`relative inline-flex h-5 w-10 items-center rounded-full ${
              statusDraft === ProductSettingsStatus.ACTIVE ? "bg-primary/70" : "bg-muted"
            }`}
            onClick={() =>
              setStatusDraft(current =>
                current === ProductSettingsStatus.ACTIVE
                  ? ProductSettingsStatus.INACTIVE
                  : ProductSettingsStatus.ACTIVE
              )
            }
            disabled={loading || saving}
            type="button"
          >
            <span
              className={`absolute h-4 w-4 rounded-full bg-white transition ${
                statusDraft === ProductSettingsStatus.ACTIVE ? "left-[calc(100%-18px)]" : "left-[6px]"
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
