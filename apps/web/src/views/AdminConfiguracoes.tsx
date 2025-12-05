'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Percent, Settings2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

type Tab = 'taxas' | 'ajustes';

const inputBase =
  'w-full rounded-[8px] border border-foreground/10 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none';

function LabeledInput({
  label,
  placeholder,
  className,
  value,
  onChange
}: {
  label: string;
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className={`flex flex-col gap-2 text-sm text-muted-foreground ${className ?? ''}`}>
      <span className="text-foreground">{label}</span>
      <input
        className={inputBase}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={event => onChange?.(event.target.value)}
      />
    </label>
  );
}

type PaymentMethod = {
  id: string;
  title: string;
  description: string;
  active: boolean;
  iconSrc: string;
};

const initialPaymentMethods: PaymentMethod[] = [
  {
    id: 'pix',
    title: 'Pix',
    description: 'Pagamentos instantâneos via PIX',
    active: true,
    iconSrc: '/images/pix.svg'
  },
  {
    id: 'boleto',
    title: 'Boleto',
    description: 'Pagamentos via boleto bancário',
    active: false,
    iconSrc: '/images/boleto.svg'
  },
  {
    id: 'credito',
    title: 'Cartão de crédito',
    description: 'Pagamentos via cartão de crédito',
    active: true,
    iconSrc: '/images/card.svg'
  }
];

function PaymentCard({ method, onToggle }: { method: PaymentMethod; onToggle: () => void }) {
  const badgeClass = method.active
    ? 'bg-primary text-primary-foreground'
    : 'bg-foreground/15 text-muted-foreground';
  const toggleClass = method.active
    ? 'bg-primary'
    : 'bg-foreground/20';
  const knobClass = method.active ? 'right-[2px]' : 'left-[2px]';

  return (
    <div className="relative flex h-full flex-col justify-between rounded-[8px] border border-foreground/10 bg-card/80 p-4">
      <span className={`absolute right-3 top-3 rounded-full px-3 py-[3px] text-[11px] font-semibold ${badgeClass}`}>
        {method.active ? 'Ativo' : 'Inativo'}
      </span>
      <div className="flex flex-col items-start gap-2">
        <span className="flex h-10 w-10 items-center justify-center text-foreground">
          <Image src={method.iconSrc} alt={method.title} width={28} height={28} className="h-7 w-7" />
        </span>
        <p className="text-base font-semibold text-foreground">{method.title}</p>
        <span className="text-xs text-muted-foreground">{method.description}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Habilitado</span>
        <button
          type="button"
          className={`relative h-5 w-9 rounded-full transition ${toggleClass}`}
          aria-label={`Alternar ${method.title}`}
          onClick={onToggle}
        >
          <span className={`absolute top-[2px] h-4 w-4 rounded-full bg-primary-foreground ${knobClass}`} />
        </button>
      </div>
    </div>
  );
}

export default function AdminConfiguracoes() {
  const [activeTab, setActiveTab] = useState<Tab>('taxas');
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const formatCurrencyValue = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const number = Number(digits) / 100;
    return number
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
      .replace(/\u00a0/g, ' ');
  };

  const formatPercentValue = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const number = Number(digits) / 100;
    return `${number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  };

  const handleInputChange = (key: string, rawValue: string, type?: 'currency' | 'percent') => {
    let formatted = rawValue;
    if (type === 'currency') {
      formatted = formatCurrencyValue(rawValue);
    } else if (type === 'percent') {
      formatted = formatPercentValue(rawValue);
    }
    setFormValues(prev => ({ ...prev, [key]: formatted }));
  };

  const getValue = (key: string) => formValues[key] ?? '';

  const handleToggleMethod = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => (method.id === id ? { ...method, active: !method.active } : method))
    );
  };

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-8 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('taxas')}
              className={`flex h-[86px] w-[190px] flex-col items-center justify-center gap-2 rounded-[8px] border px-3 transition ${
                activeTab === 'taxas'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-foreground/10 bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground'
              }`}
            >
              <Percent className="h-6 w-6" aria-hidden />
              <span className="text-sm font-semibold">Taxas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ajustes')}
              className={`flex h-[86px] w-[190px] flex-col items-center justify-center gap-2 rounded-[8px] border px-3 transition ${
                activeTab === 'ajustes'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-foreground/10 bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground'
              }`}
            >
              <Settings2 className="h-6 w-6" aria-hidden />
              <span className="text-sm font-semibold">Ajustes gerais</span>
            </button>
          </div>

          {activeTab === 'taxas' ? (
            <div className="rounded-[8px] border border-foreground/10 bg-card/80 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.45)] dark:border-white/10">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Alterar taxas</h2>
                <p className="text-sm text-muted-foreground">Essa é a taxa final que a empresa irá pagar</p>
              </div>

              <div className="mt-4 flex w-full max-w-[260px] flex-col gap-2">
                <label className="text-sm font-semibold text-muted-foreground">Tipo de taxa</label>
                <select className={`${inputBase} appearance-none`} defaultValue="default">
                  <option value="default">Default</option>
                </select>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[8px] border border-foreground/10 bg-card p-5 shadow-[0_12px_36px_rgba(0,0,0,0.45)] dark:border-white/10">
                  <h3 className="text-lg font-semibold text-foreground">Pix</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <LabeledInput
                      label="Taxa fixa"
                      placeholder="R$0,00"
                      value={getValue('pixTaxaFixa')}
                      onChange={value => handleInputChange('pixTaxaFixa', value, 'currency')}
                    />
                    <LabeledInput
                      label="Taxa variável"
                      placeholder="R$0,00"
                      value={getValue('pixTaxaVariavel')}
                      onChange={value => handleInputChange('pixTaxaVariavel', value, 'currency')}
                    />
                    <LabeledInput
                      label="Adquirente"
                      placeholder="Adquirente"
                      value={getValue('pixAdquirente')}
                      onChange={value => handleInputChange('pixAdquirente', value)}
                    />
                    <LabeledInput
                      label="Tempo de liberação"
                      placeholder="D+0"
                      value={getValue('pixTempo')}
                      onChange={value => handleInputChange('pixTempo', value)}
                    />
                  </div>
                </div>

                <div className="rounded-[8px] border border-foreground/10 bg-card p-5 shadow-[0_12px_36px_rgba(0,0,0,0.45)] dark:border-white/10">
                  <h3 className="text-lg font-semibold text-foreground">Boleto</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <LabeledInput
                      label="Taxa fixa"
                      placeholder="R$0,00"
                      value={getValue('boletoTaxaFixa')}
                      onChange={value => handleInputChange('boletoTaxaFixa', value, 'currency')}
                    />
                    <LabeledInput
                      label="Taxa variável"
                      placeholder="R$0,00"
                      value={getValue('boletoTaxaVariavel')}
                      onChange={value => handleInputChange('boletoTaxaVariavel', value, 'currency')}
                    />
                    <LabeledInput
                      label="Adquirente"
                      placeholder="Adquirente"
                      value={getValue('boletoAdquirente')}
                      onChange={value => handleInputChange('boletoAdquirente', value)}
                    />
                    <LabeledInput
                      label="Tempo de liberação"
                      placeholder="D+0"
                      value={getValue('boletoTempo')}
                      onChange={value => handleInputChange('boletoTempo', value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[8px] border border-foreground/10 bg-card p-5 shadow-[0_12px_36px_rgba(0,0,0,0.45)] dark:border-white/10">
                <h3 className="text-lg font-semibold text-foreground">Cartão de crédito</h3>
                <div className="mt-4 flex flex-col gap-4 md:flex-row">
                  <LabeledInput
                    className="flex-1"
                    label="Taxa fixa"
                    placeholder="R$0,00"
                    value={getValue('cartaoTaxaFixa')}
                    onChange={value => handleInputChange('cartaoTaxaFixa', value, 'currency')}
                  />
                  <LabeledInput
                    className="flex-1"
                    label="Adquirente"
                    placeholder="Adquirente"
                    value={getValue('cartaoAdquirente')}
                    onChange={value => handleInputChange('cartaoAdquirente', value)}
                  />
                  <LabeledInput
                    className="flex-1"
                    label="Tempo de liberação"
                    placeholder="D+0"
                    value={getValue('cartaoTempo')}
                    onChange={value => handleInputChange('cartaoTempo', value)}
                  />
                </div>

                <div className="mt-6 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    'Cartão (1x)',
                    'Cartão (2x)',
                    'Cartão (3x)',
                    'Cartão (4x)',
                    'Cartão (5x)',
                    'Cartão (6x)',
                    'Cartão (7x)',
                    'Cartão (8x)',
                    'Cartão (9x)',
                    'Cartão (10x)',
                    'Cartão (11x)',
                    'Cartão (12x)'
                  ].map((label, index) => (
                    <LabeledInput
                      key={label}
                      label={label}
                      placeholder="0,00%"
                      value={getValue(`cartaoParcela${index + 1}`)}
                      onChange={value => handleInputChange(`cartaoParcela${index + 1}`, value, 'percent')}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Atualizar taxas
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-[8px] border border-foreground/10 bg-card/80 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.45)] dark:border-white/10">
              <h2 className="text-lg font-semibold text-foreground">Ajustes gerais</h2>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[8px] border border-foreground/10 bg-card p-5">
                  <h3 className="text-lg font-semibold text-foreground">Produtos</h3>
                  <div className="mt-4 grid gap-3">
                    <LabeledInput
                      label="Ticket mínimo"
                      placeholder="R$0,00"
                      value={getValue('produtoTicketMin')}
                      onChange={value => handleInputChange('produtoTicketMin', value, 'currency')}
                    />
                    <LabeledInput
                      label="Ticket máximo"
                      placeholder="R$0,00"
                      value={getValue('produtoTicketMax')}
                      onChange={value => handleInputChange('produtoTicketMax', value, 'currency')}
                    />
                  </div>
                </div>
                <div className="rounded-[8px] border border-foreground/10 bg-card p-5">
                  <h3 className="text-lg font-semibold text-foreground">Saque</h3>
                  <div className="mt-4 grid gap-3">
                    <LabeledInput
                      label="Valor mínimo"
                      placeholder="R$0,00"
                      value={getValue('saqueValorMin')}
                      onChange={value => handleInputChange('saqueValorMin', value, 'currency')}
                    />
                    <LabeledInput
                      label="Valor máximo"
                      placeholder="R$0,00"
                      value={getValue('saqueValorMax')}
                      onChange={value => handleInputChange('saqueValorMax', value, 'currency')}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[8px] border border-foreground/10 bg-card p-5">
                <h3 className="text-lg font-semibold text-foreground">Meios de pagamento</h3>
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  {paymentMethods.map(method => (
                    <PaymentCard key={method.id} method={method} onToggle={() => handleToggleMethod(method.id)} />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
