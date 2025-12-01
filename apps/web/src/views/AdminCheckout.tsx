'use client';

import { Check, CheckCircle2, CreditCard, Lock, ShieldCheck, Star } from 'lucide-react';
import Image from 'next/image';

const inputClass =
  'h-10 w-full rounded-[6px] border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none';

const paymentButtons = [
  { id: 'pix', label: 'Pix', iconSrc: '/images/pix.svg' },
  { id: 'card', label: 'Cartão', iconSrc: '/images/card.svg' },
  { id: 'boleto', label: 'Boleto', iconSrc: '/images/boleto.svg' }
];

const bumps = [
  { id: 'bump-1', title: 'Order Bump 01', price: 'R$ 00,00', promo: 'R$00,00' },
  { id: 'bump-2', title: 'Order Bump 02', price: 'R$ 00,00', promo: 'R$00,00' }
];

export default function AdminCheckout() {
  return (
    <div className="min-h-screen bg-[#060606] text-white">
      <header className="flex items-center justify-between gap-4 bg-[#08a83e] px-4 py-4 text-xl font-semibold sm:px-8">
        <span className="tracking-tight">00:00:00</span>
        <CheckCircle2 className="h-10 w-10" />
        <span className="text-sm sm:text-base">Frase de contagem regressiva</span>
      </header>

      <div className="h-28 w-full bg-[#d9d9d9]" />

      <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-10 lg:flex-row lg:items-start">
        <section className="flex-1 space-y-5">
          <div className="rounded-[10px] border border-white/10 bg-[#0b0b0b] p-5 sm:p-6">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-white/20 text-sm">1</span>
              <p>Identificação</p>
            </div>

            <div className="mt-4 space-y-3">
              <label className="space-y-2 text-xs text-neutral-400">
                <span>Nome e sobrenome</span>
                <input className={inputClass} placeholder="Digite um nome" />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-xs text-neutral-400">
                  <span>CPF/CNPJ</span>
                  <input className={inputClass} placeholder="Digite um nome" />
                </label>
                <label className="space-y-2 text-xs text-neutral-400">
                  <span>Celular</span>
                  <input className={inputClass} placeholder="Digite um nome" />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-xs text-neutral-400">
                  <span>E-mail</span>
                  <input className={inputClass} placeholder="Digite um nome" />
                </label>
                <label className="space-y-2 text-xs text-neutral-400">
                  <span>Confirmar e-mail</span>
                  <input className={inputClass} placeholder="Digite um nome" />
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-[10px] border border-white/10 bg-[#0b0b0b] p-5 sm:p-6">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-white/20 text-sm">2</span>
              <p>Pagamento</p>
            </div>

            <div className="mt-4 flex items-center gap-3">
              {paymentButtons.map(button => (
                <button
                  key={button.id}
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-white/20 bg-[#111] text-white transition hover:border-emerald-500"
                  aria-label={button.label}
                >
                  <Image src={button.iconSrc} alt={button.label} width={28} height={28} className="h-7 w-7 object-contain" />
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <label className="space-y-2 text-xs text-neutral-400">
                <span>Nome do titular</span>
                <input className={inputClass} placeholder="Digite um nome" />
              </label>

              <label className="space-y-2 text-xs text-neutral-400">
                <span>Número do cartão</span>
                <div className="relative">
                  <input className={`${inputClass} pr-10`} placeholder="Digite um nome" />
                  <CreditCard className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                </div>
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-2 text-xs text-neutral-400">
                  <span>Vencimento</span>
                  <input className={inputClass} placeholder="Digite um nome" />
                </label>
                <label className="space-y-2 text-xs text-neutral-400">
                  <span>CVV</span>
                  <input className={inputClass} placeholder="Digite um nome" />
                </label>
                <label className="space-y-2 text-xs text-neutral-400">
                  <span>Parcelamento</span>
                  <input className={inputClass} placeholder="Digite um nome" />
                </label>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {bumps.map(bump => (
                <div key={bump.id} className="rounded-[6px] border border-white/10 bg-[#0e0e0e] shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                  <div className="rounded-t-[6px] bg-[#141414] px-4 py-2 text-center text-sm text-neutral-300">
                    Lorem Ipsum is simply dummy text of the printing and
                  </div>
                  <label className="flex items-center gap-3 px-4 py-3">
                    <input type="checkbox" className="h-5 w-5 rounded border-white/30 bg-transparent" />
                    <div className="flex items-center gap-3">
                      <Image src="/images/produto.png" alt={bump.title} width={64} height={64} className="h-[64px] w-[64px] rounded-[10px] object-cover" />
                      <div className="flex flex-col gap-1">
                        <p className="text-lg font-semibold text-white leading-tight">{bump.title}</p>
                        <div className="flex flex-wrap items-center gap-2 text-base">
                          <span className="text-rose-500">{bump.price}</span>
                          <span className="text-neutral-300">por apenas</span>
                          <span className="text-emerald-500">{bump.promo}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-[6px] bg-[#0f864b] px-4 py-3 text-sm font-semibold uppercase tracking-tight text-white transition hover:brightness-110"
            >
              Comprar agora
            </button>
          </div>
        </section>

        <aside className="w-full max-w-[320px] space-y-4">
          <div className="rounded-[10px] border border-white/10 bg-[#0b0b0b] p-4">
            <div className="flex items-center gap-3">
              <Image src="/images/pix.svg" alt="Produto" width={64} height={64} className="h-16 w-16 rounded-[10px]" />
              <div className="flex flex-col">
                <p className="text-base font-semibold text-white">Produto 01</p>
                <span className="text-sm text-white">R$ 97,00</span>
              </div>
            </div>
          </div>

          <div className="rounded-[10px] border border-white/10 bg-[#0b0b0b] p-4 space-y-4">
            {[
              { icon: ShieldCheck, title: 'Dados protegidos', desc: 'Suas informações são confidenciais e seguras' },
              { icon: Lock, title: 'Pagamento 100% Seguro', desc: 'Todas as transações são criptografadas' },
              { icon: Check, title: 'Conteúdo Aprovado', desc: 'Revisado e validado por especialistas' },
              { icon: CheckCircle2, title: 'Garantia de 7 dias', desc: 'Você tem 7 dias para testar o produto' }
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 text-emerald-400">
                  <item.icon className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-neutral-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[10px] border border-white/10 bg-[#0b0b0b] p-4 space-y-6">
            {['Depoimentos', 'Depoimentos'].map((title, idx) => (
              <div key={`${title}-${idx}`} className="space-y-3">
                <p className="text-lg font-semibold text-white">{title}</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/70" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-white">Nome e sobrenome</p>
                      <div className="flex gap-1 text-[#8ea000]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-[#8ea000]" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-300">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s,
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
