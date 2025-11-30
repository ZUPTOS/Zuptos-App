'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BadgeCheck, Shield, Users, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

type Role = 'Admin' | 'Financeiro' | 'Suporte';

type Collaborator = {
  id: string;
  email: string;
  lastAccessDate: string;
  lastAccessTime: string;
  role: Role;
};

const collaborators: Collaborator[] = [
  { id: '#8759850', email: 'email@email.com', lastAccessDate: '05/06/2025', lastAccessTime: 'às 18:45', role: 'Admin' },
  { id: '#8759850', email: 'email@email.com', lastAccessDate: '05/06/2025', lastAccessTime: 'às 18:45', role: 'Financeiro' },
  { id: '#8759850', email: 'email@email.com', lastAccessDate: '05/06/2025', lastAccessTime: 'às 18:45', role: 'Suporte' }
];

const roleBadge: Record<Role, string> = {
  Admin: 'bg-purple-600/20 text-purple-300',
  Financeiro: 'bg-emerald-600/20 text-emerald-300',
  Suporte: 'bg-sky-600/25 text-sky-300'
};

const permissionSections = [
  {
    id: 'general',
    title: 'Alterar permissões',
    items: [
      { title: 'Usuários', manage: true, view: true },
      { title: 'Taxas', manage: false, view: true },
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

export default function AdminColaboradores() {
  const [activeTab, setActiveTab] = useState<'colaboradores' | 'cargos'>('colaboradores');
  const [selectedRole, setSelectedRole] = useState<Role>('Admin');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const router = useRouter();

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-8 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[26px] font-semibold text-foreground">Colaboradores</p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAddOpen(prev => !prev)}
                className="rounded-[10px] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_rgba(108,39,215,0.4)] transition hover:brightness-110"
              >
                Adicionar colaborador
              </button>

              {isAddOpen && (
                <div className="absolute right-0 z-50 mt-2 w-[280px] rounded-[12px] border border-foreground/10 bg-card shadow-[0_18px_50px_rgba(0,0,0,0.6)] dark:border-white/10">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/10">
                    <span className="text-sm font-semibold text-foreground">Adicionar colaborador</span>
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Fechar"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <div className="flex flex-col gap-3 px-5 py-5">
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Nome</span>
                      <input
                        type="text"
                        placeholder="Todos"
                        className="w-full rounded-[10px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">E-mail</span>
                      <input
                        type="email"
                        placeholder="Todos"
                        className="w-full rounded-[10px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Telefone</span>
                      <input
                        type="tel"
                        placeholder="Todos"
                        className="w-full rounded-[10px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Cargo</span>
                      <select
                        className="w-full appearance-none rounded-[10px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground shadow-inner focus:border-primary/50 focus:outline-none"
                        defaultValue="Admin"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Financeiro">Financeiro</option>
                        <option value="Suporte">Suporte</option>
                      </select>
                    </label>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddOpen(false)}
                        className="h-10 flex-1 rounded-[10px] border border-foreground/15 bg-card text-sm font-semibold text-muted-foreground transition hover:border-foreground/30"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="h-10 flex-1 rounded-[10px] bg-primary text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:brightness-110"
                      >
                        Adicionar colaborador
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('colaboradores')}
              className={`flex h-[86px] w-[190px] flex-col items-center justify-center gap-2 rounded-[10px] border px-3 transition ${
                activeTab === 'colaboradores'
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_10px_30px_rgba(108,39,215,0.35)]'
                  : 'border-foreground/10 bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground'
              }`}
            >
              <Users className="h-6 w-6" aria-hidden />
              <span className="text-sm font-semibold">Colaboradores</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cargos')}
              className={`flex h-[86px] w-[190px] flex-col items-center justify-center gap-2 rounded-[10px] border px-3 transition ${
                activeTab === 'cargos'
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_10px_30px_rgba(108,39,215,0.35)]'
                  : 'border-foreground/10 bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground'
              }`}
            >
              <Shield className="h-6 w-6" aria-hidden />
              <span className="text-sm font-semibold">Cargos</span>
            </button>
          </div>

          {activeTab === 'colaboradores' ? (
            <div className="overflow-hidden rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_16px_44px_rgba(0,0,0,0.55)] dark:border-white/5 dark:bg-[#0b0b0b]">
              <table className="w-full text-sm text-foreground">
                <thead className="bg-foreground/5 text-muted-foreground">
                  <tr className="border-b border-foreground/10">
                    <th className="w-[18%] px-6 py-3 text-left font-semibold">Nome</th>
                    <th className="w-[34%] px-6 py-3 text-left font-semibold">E-mail</th>
                    <th className="w-[26%] px-6 py-3 text-left font-semibold">Último acesso</th>
                    <th className="w-[22%] px-6 py-3 text-left font-semibold">Cargo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/10">
                  {collaborators.map((collaborator, index) => (
                    <tr
                      key={`${collaborator.id}-${index}`}
                      className="cursor-pointer align-middle hover:bg-foreground/5 transition"
                      onClick={() => router.push('/admin/colaboradores/detalhes')}
                    >
                      <td className="px-6 py-4 text-muted-foreground">{collaborator.id}</td>
                      <td className="px-6 py-4 text-muted-foreground">{collaborator.email}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{collaborator.lastAccessDate}</span>
                          <span className="text-[11px] uppercase text-muted-foreground">{collaborator.lastAccessTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${roleBadge[collaborator.role]}`}>
                          <BadgeCheck className="h-3 w-3" aria-hidden />
                          {collaborator.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex w-full max-w-[260px] flex-col gap-2">
                <label className="text-sm font-semibold text-muted-foreground">Cargo</label>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value as Role)}
                    className="w-full appearance-none rounded-[10px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.35)] focus:border-primary/50 focus:outline-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Suporte">Suporte</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">▼</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {permissionSections.map(section => (
                  <div key={section.id} className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_12px_36px_rgba(0,0,0,0.45)] dark:border-white/10">
                    {section.title && (
                      <div className="border-b border-foreground/10 px-6 py-4">
                        <p className="text-sm font-semibold text-muted-foreground">{section.title}</p>
                      </div>
                    )}
                    <div className="px-6 py-4">
                      <div className="divide-y divide-foreground/10">
                        {section.items.map(item => (
                          <div key={`${section.id}-${item.title}`} className="grid grid-cols-[1fr,1fr,1fr] items-center gap-4 py-3">
                            <span className="text-base font-semibold text-foreground">{item.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded border border-foreground/15 bg-transparent" aria-hidden />
                              <span className="text-sm text-muted-foreground">Gerenciar</span>
                            </div>
                            {item.view ? (
                              <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded border border-foreground/15 bg-transparent" aria-hidden />
                                <span className="text-sm text-muted-foreground">Ver dados</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_rgba(108,39,215,0.4)] transition hover:brightness-110"
                >
                  Atualizar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
