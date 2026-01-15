'use client';

import Image from 'next/image';

const feeCards = [
  {
    id: 'boleto',
    title: 'Boletos',
    description: 'Os boletos emitidos não são cobrados, apenas os pagos',
    fee: '2,99% + 1,99/ boleto',
    release: 'Prazo de liberação:',
    icon: '/images/boleto.svg',
  },
  {
    id: 'pix',
    title: 'Pix',
    description: 'PIX é o novo meio de pagamento instantâneo da plataforma',
    fee: '2,99% + 1,99/ transação',
    release: 'Prazo de liberação:',
    icon: '/images/pix.svg',
  },
  {
    id: 'credito',
    title: 'Cartão de crédito',
    description: 'Para ver as taxas por parcela, clique aqui.',
    fee: '2,99% + 1,99/ transação',
    release: 'Prazo de liberação:',
    icon: '/images/card.svg',
    highlight: true,
  },
] as const;

export default function FeesTab() {
  return (
    <div className="mx-auto flex w-full flex-col gap-3" style={{ maxWidth: 'var(--fin-table-width)' }}>
      <div className="grid gap-4 lg:grid-cols-2">
        {feeCards.map((card) => (
          <div
            key={card.id}
            className="rounded-[7px] border border-muted bg-card p-5 text-card-foreground shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{card.title}</h3>
                {card.id === 'credito' ? (
                  <p className="text-sm text-muted-foreground">
                    Para ver as taxas por parcela,{' '}
                    <span className="text-emerald-400 font-semibold">clique aqui.</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                )}
              </div>
              <div className="flex h-full w-full items-center justify-end">
                <Image src={card.icon} alt={card.title} width={46} height={46} className="h-40 w-40" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1 text-sm">
              <span className="text-lg font-semibold text-card-foreground">{card.fee}</span>
              <span className="text-xs text-muted-foreground">{card.release}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
