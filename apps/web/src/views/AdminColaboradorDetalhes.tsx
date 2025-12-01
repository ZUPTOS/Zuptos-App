'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Ban, ExternalLink, KeySquare, LogIn, Phone } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const collaborator = {
  name: 'Nome',
  phone: '2797-138-0',
  email: 'xxxxxxxxxxxx',
  joinDate: '05/06/2025',
  joinTime: 'às 18:45',
  status: 'Financeiro'
};

const statusClass = 'bg-emerald-600/20 text-emerald-300';

const permissionSections = [
  {
    id: 'general',
    title: 'Alterar permissões',
    items: [
      { title: 'Usuários', manage: true, view: true },
      { title: 'Taxas', manage: false, view: false },
      { title: 'Permissões', manage: true, view: true },
      { title: 'Financeiro', manage: true, view: true },
      { title: 'Indicação', manage: true, view: true },
      { title: 'Ações', manage: true, view: false }
    ]
  },
  {
    id: 'transactions',
    title: '',
    items: [
      { title: 'Transações', manage: false, view: false },
      { title: 'Financeiro', manage: false, view: true },
      { title: 'Participantes', manage: false, view: true },
      { title: 'Informações', manage: false, view: true }
    ]
  },
  {
    id: 'saques',
    title: '',
    items: [
      { title: 'Saques', manage: true, view: true }
    ]
  },
  {
    id: 'financeiro',
    title: '',
    items: [
      { title: 'Financeiro', manage: false, view: true }
    ]
  },
  {
    id: 'produtos',
    title: '',
    items: [
      { title: 'Produtos', manage: true, view: true }
    ]
  },
  {
    id: 'documentos',
    title: '',
    items: [
      { title: 'Documentos', manage: true, view: true }
    ]
  },
  {
    id: 'config',
    title: '',
    items: [
      { title: 'Configurações', manage: true, view: true }
    ]
  }
] as const;

function PermissionRow({ title, view }: { title: string; view: boolean }) {
  const checkboxBase = 'flex h-5 w-5 items-center justify-center rounded border border-foreground/15 bg-transparent';
  const labelBase = 'text-sm text-muted-foreground';

  return (
    <div className="grid grid-cols-[1fr,1fr,1fr] items-center gap-4 py-3">
      <span className="text-base font-semibold text-foreground">{title}</span>
      <div className="flex items-center gap-2">
        <span className={checkboxBase} aria-hidden />
        <span className={labelBase}>Gerenciar</span>
      </div>
      {view ? (
        <div className="flex items-center gap-2">
          <span className={checkboxBase} aria-hidden />
          <span className={labelBase}>Ver dados</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground" />
      )}
    </div>
  );
}

function PermissionBlock({ section }: { section: (typeof permissionSections)[number] }) {
  return (
    <div className="rounded-[12px] border border-foreground/10 bg-card/80 p-6 shadow-[0_12px_36px_rgba(0,0,0,0.45)] dark:border-white/10">
      {section.title && <p className="pb-4 text-sm font-semibold text-muted-foreground">{section.title}</p>}
      <div className="divide-y divide-foreground/10">
        {section.items.map(item => (
          <PermissionRow key={`${section.id}-${item.title}`} title={item.title} manage={item.manage} view={item.view} />
        ))}
      </div>
    </div>
  );
}

export default function AdminColaboradorDetalhes() {
  const actionButtonClass =
    'flex items-center gap-2 rounded-[8px] border border-foreground/15 bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary';
  const router = useRouter();

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-8 lg:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar
          </button>

          <div className="rounded-[12px] border border-foreground/10 bg-card shadow-[0_16px_44px_rgba(0,0,0,0.55)] dark:border-white/5 dark:bg-[#0b0b0b]">
            <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
              <p className="text-sm font-semibold text-muted-foreground">Dados do colaborador</p>
              <div className="flex items-center gap-2 text-xs">
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass}`}>{collaborator.status}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Nome do usuário</span>
                <p className="text-xl font-semibold text-foreground">{collaborator.name}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Telefone</span>
                <p className="text-xl font-semibold text-foreground">{collaborator.phone}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">E-mail</span>
                <p className="text-xl font-semibold text-foreground">{collaborator.email}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Data de adesão</span>
                <p className="text-xl font-semibold text-foreground">{collaborator.joinDate}</p>
                <span className="text-[11px] uppercase text-muted-foreground">{collaborator.joinTime}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button type="button" className={actionButtonClass}>
              <Ban className="h-4 w-4" aria-hidden />
              Bloquear usuário
            </button>
            <button type="button" className={actionButtonClass}>
              <Phone className="h-4 w-4" aria-hidden />
              Entrar em contato
            </button>
            <button type="button" className={actionButtonClass}>
              <KeySquare className="h-4 w-4" aria-hidden />
              Redefinir senha
            </button>
            <button type="button" className={actionButtonClass}>
              <LogIn className="h-4 w-4" aria-hidden />
              Fazer login
            </button>
          </div>

          {permissionSections.map(section => (
            <PermissionBlock key={section.id} section={section} />
          ))}

          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-[8px] bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_rgba(108,39,215,0.4)] transition hover:brightness-110"
            >
              Atualizar
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
