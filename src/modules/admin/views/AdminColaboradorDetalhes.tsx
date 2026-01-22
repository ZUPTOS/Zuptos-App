'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Ban, ExternalLink, KeySquare, LogIn, Phone } from 'lucide-react';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';

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
    id: 'usuarios',
    title: 'Usuários',
    items: [
      { title: 'Taxas', manage: true, view: true },
      { title: 'Permissões', manage: true, view: true },
      { title: 'Financeiro', manage: true, view: true },
      { title: 'Indicação', manage: true, view: true },
      { title: 'Ações', manage: true, view: false }
    ]
  },
  {
    id: 'transacoes',
    title: 'Transações',
    items: [
      { title: 'Financeiro', manage: true, view: true },
      { title: 'Participantes', manage: false, view: true },
      { title: 'Informações', manage: false, view: true }
    ]
  },
  {
    id: 'saques',
    title: '',
    items: [{ title: 'Saques', manage: true, view: true }]
  },
  {
    id: 'financeiro-extra',
    title: '',
    items: [{ title: 'Financeiro', manage: false, view: true }]
  },
  {
    id: 'produtos',
    title: '',
    items: [{ title: 'Produtos', manage: true, view: true }]
  },
  {
    id: 'documentos',
    title: '',
    items: [{ title: 'Documentos', manage: true, view: true }]
  },
  {
    id: 'config',
    title: '',
    items: [{ title: 'Configurações', manage: true, view: true }]
  }
] as const;

export default function AdminColaboradorDetalhes() {
  const router = useRouter();
  const [permissionsState, setPermissionsState] = useState<Record<string, { manage: boolean; view: boolean }>>(() => {
    const initial: Record<string, { manage: boolean; view: boolean }> = {};
    permissionSections.forEach(section => {
      section.items.forEach(item => {
        const key = `${section.id}-${item.title}`;
        initial[key] = { manage: false, view: false };
      });
    });
    return initial;
  });

  const togglePermission = (key: string, field: 'manage' | 'view') => {
    setPermissionsState(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: !prev[key][field] }
    }));
  };

  const checkboxClass = "ui-checkbox h-[24px] w-[24px]";
  const actionButtonClass =
    'flex justify-center items-center gap-2 rounded-[7px] border border-foreground/15 bg-card px-3 py-4 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary';

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full gap-4 max-w-[1180px] flex-col px-4 py-8 lg:px-8">
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
                <div className="flex items-center gap-2">
                  <p className="text-xl font-semibold text-foreground">{collaborator.joinDate}</p>
                  <span className="text-[11px] uppercase text-muted-foreground">{collaborator.joinTime}</span>
                </div>
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

          <div className="rounded-[7px] border border-foreground/15 bg-card/70 shadow-[0_14px_40px_rgba(0,0,0,0.45)] dark:border-white/10">
            <div className="border-b border-foreground/10 px-4 py-5 md:px-6">
              <p className="text-sm font-semibold text-muted-foreground">Alterar permissões</p>
            </div>
            <div className="p-4 md:p-6">
              {permissionSections.map(section => (
                <div key={section.id} className="mb-4 rounded-[7px] border border-foreground/10 bg-card/80 shadow-[0_12px_36px_rgba(0,0,0,0.45)] last:mb-0 dark:border-white/10">
                  {section.title && (
                    <div className="px-6 pt-4 pb-2">
                      <p className="text-sm font-semibold text-muted-foreground">{section.title}</p>
                    </div>
                  )}
                  <div className="flex flex-col gap-3 px-6 py-4">
                    {section.items.map(item => {
                      const key = `${section.id}-${item.title}`;
                      const state = permissionsState[key] ?? { manage: false, view: false };

                      const manageControl = (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {item.manage ? (
                            <>
                              <input
                                type="checkbox"
                                checked={state.manage}
                                onChange={() => togglePermission(key, 'manage')}
                                className={checkboxClass}
                                aria-label={`Gerenciar ${item.title}`}
                              />
                              <span className="select-none">Gerenciar</span>
                            </>
                          ) : (
                            <span className="select-none text-transparent">Gerenciar</span>
                          )}
                        </div>
                      );

                      const viewControl = (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {item.view ? (
                            <>
                              <input
                                type="checkbox"
                                checked={state.view}
                                onChange={() => togglePermission(key, 'view')}
                                className={checkboxClass}
                                aria-label={`Ver dados de ${item.title}`}
                              />
                              <span className="select-none">Ver dados</span>
                            </>
                          ) : (
                            <span className="select-none text-transparent">Ver dados</span>
                          )}
                        </div>
                      );

                      const firstControl = item.manage ? manageControl : viewControl;
                      const secondControl = item.manage ? viewControl : <span className="text-transparent select-none">Ver dados</span>;

                      return (
                        <div key={key} className="grid grid-cols-[minmax(180px,240px)_140px_140px] items-center gap-4">
                          <span className="text-base font-semibold text-foreground">{item.title}</span>
                          {firstControl}
                          {secondControl}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
            <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="rounded-[7px] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
                >
                  Atualizar
                </button>
              </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
