'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BadgeCheck, Shield, Users, X } from 'lucide-react';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';

type Role = string;

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

const roleBadge: Record<string, string> = {
  Admin: 'bg-purple-600/20 text-purple-300',
  Financeiro: 'bg-emerald-600/20 text-emerald-300',
  Suporte: 'bg-sky-600/25 text-sky-300'
};

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

export default function AdminColaboradores() {
  const [activeTab, setActiveTab] = useState<'colaboradores' | 'cargos'>('colaboradores');
  const [roles, setRoles] = useState<Role[]>(['Admin', 'Financeiro', 'Suporte']);
  const [selectedRole, setSelectedRole] = useState<Role>('Admin');
  const [isAddOpen, setIsAddOpen] = useState(false);
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
  const router = useRouter();
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const handleCollaboratorClick = () => {
    router.push('/admin/colaborador/detalhes');
  };

  const togglePermission = (key: string, field: 'manage' | 'view') => {
    setPermissionsState(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: !prev[key][field] }
    }));
  };

  const handleRoleSelect = (value: string) => {
    if (value === '__new__') {
      setIsNewRoleModalOpen(true);
      return;
    }
    setSelectedRole(value);
  };

  const handleConfirmNewRole = () => {
    const trimmed = newRoleName.trim();
    if (!trimmed) return;
    setRoles(prev => Array.from(new Set([...prev, trimmed])));
    setSelectedRole(trimmed);
    setNewRoleName('');
    setIsNewRoleModalOpen(false);
  };

  return (
    <>
      <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
        <div className="w-full">
          <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-8 lg:px-8">
            <div className="space-y-1">
              <p className="text-[26px] font-semibold text-foreground">Colaboradores</p>
            </div>

            <div className="flex flex-wrap items-end justify-between ">
              <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('colaboradores')}
                className={`flex h-[86px] w-[190px] flex-col items-center justify-center gap-2 rounded-[10px] border px-3 transition ${
                  activeTab === 'colaboradores'
                    ? 'border-primary bg-primary/10 text-primary'
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
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-foreground/10 bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                }`}
              >
                <Shield className="h-6 w-6" aria-hidden />
                <span className="text-sm font-semibold">Cargos</span>
              </button>
              </div>
              {activeTab === 'colaboradores' && (
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="rounded-[7px] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
                >
                  Adicionar colaborador
                </button>
              )}
            </div>

            {activeTab === 'colaboradores' ? (
              <div className="overflow-hidden rounded-[7px] border border-foreground/10 bg-card/80 shadow-[0_16px_44px_rgba(0,0,0,0.55)] dark:border-white/5 dark:bg-[#0b0b0b]">
                <table className="w-full text-sm text-foreground">
                  <thead className="bg-foreground/5 text-muted-foreground">
                    <tr>
                      <th className="w-[18%] px-6 py-3 text-left font-semibold">Nome</th>
                      <th className="w-[34%] px-6 py-3 text-left font-semibold">E-mail</th>
                      <th className="w-[26%] px-6 py-3 text-left font-semibold">Último acesso</th>
                      <th className="w-[22%] px-6 py-3 text-left font-semibold">Cargo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collaborators.map((collaborator, index) => (
                      <tr
                        key={`${collaborator.id}-${index}`}
                        className="cursor-pointer align-middle hover:bg-foreground/5 transition"
                        onClick={handleCollaboratorClick}
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
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
                              roleBadge[collaborator.role] ?? 'bg-foreground/10 text-foreground'
                            }`}
                          >
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
                      onChange={e => handleRoleSelect(e.target.value)}
                      className="w-full appearance-none rounded-[6px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.35)] focus:border-primary/50 focus:outline-none"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                      <option value="__new__">Novo cargo...</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">▼</span>
                  </div>
                </div>

                <div className="rounded-[7px] border border-foreground/15 bg-card/70 shadow-[0_14px_40px_rgba(0,0,0,0.45)] dark:border-white/10">
                  <div className="border-b border-foreground/10 px-4 py-5 md:px-6">
                    <p className="text-sm font-semibold text-muted-foreground">Alterar permissões</p>
                  </div>
                  <div className="flex flex-col gap-4 p-4 md:p-6">
                    {permissionSections.map(section => (
                      <div key={section.id} className="rounded-[7px] border border-foreground/10 bg-card/80 shadow-[0_12px_36px_rgba(0,0,0,0.45)] dark:border-white/10">
                        {section.title && (
                          <div className="px-6 pt-4 pb-2">
                            <p className="text-sm font-semibold text-muted-foreground">{section.title}</p>
                          </div>
                        )}
                        <div className="flex flex-col gap-3 px-6 py-4">
                          {section.items.map(item => {
                            const key = `${section.id}-${item.title}`;
                            const state = permissionsState[key] ?? { manage: false, view: false };
                            const checkboxClass =
                              "relative h-[24px] w-[24px] appearance-none rounded-[6px] border border-foreground/25 bg-transparent transition-all checked:border-primary checked:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 before:absolute before:inset-0 before:flex before:items-center before:justify-center before:text-[14px] before:font-bold before:text-white before:opacity-0 checked:before:opacity-100 before:content-['✓']";

                            const manageControl = (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {item.manage ? (
                                  <>
                                    <input
                                      type="checkbox"
                                      checked={state.manage}
                                      onChange={() => togglePermission(key, 'manage')}
                                      className={checkboxClass}
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
                              <div
                                key={key}
                                className="grid grid-cols-[minmax(180px,240px)_140px_140px] items-center gap-4"
                              >
                                <span className="text-base font-semibold text-foreground">{item.title}</span>
                                {firstControl}
                                {secondControl}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        className="rounded-[7px] bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_rgba(108,39,215,0.4)] transition hover:brightness-110"
                      >
                        Atualizar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>

      {isNewRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-[320px] rounded-[10px] bg-card px-6 py-5 text-card-foreground shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between">
              <p className="text-[16px] font-semibold text-foreground">Insira o nome do cargo</p>
              <button
                type="button"
                onClick={() => {
                  setIsNewRoleModalOpen(false);
                  setNewRoleName('');
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Fechar modal de novo cargo"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                placeholder="Nome"
                className="w-full rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleConfirmNewRole}
                className="w-full rounded-[8px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(108,39,215,0.5)] transition hover:brightness-110"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-[360px] rounded-[7px] border border-foreground/10 bg-card px-6 py-6 text-card-foreground shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between pb-4">
              <span className="text-[16px] font-semibold text-foreground">Adicionar colaborador</span>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <label className="space-y-2 text-sm text-foreground">
                <span className="font-semibold">Nome</span>
                <input
                  type="text"
                  placeholder="Todos"
                  className="w-full rounded-[7px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-foreground">
                <span className="font-semibold">E-mail</span>
                <input
                  type="email"
                  placeholder="Todos"
                  className="w-full rounded-[7px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-foreground">
                <span className="font-semibold">Telefone</span>
                <input
                  type="tel"
                  placeholder="Todos"
                  className="w-full rounded-[7px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-foreground">
                <span className="font-semibold">Cargo</span>
                <select
                  className="w-full appearance-none rounded-[7px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground shadow-inner focus:border-primary/50 focus:outline-none"
                  value={selectedRole}
                  onChange={e => handleRoleSelect(e.target.value)}
                >
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                  <option value="__new__">Novo cargo...</option>
                </select>
              </label>

              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="h-10 flex-1 rounded-[7px] border border-foreground/15 bg-card text-sm font-semibold text-muted-foreground transition hover:border-foreground/30"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="h-10 flex-1 rounded-[7px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:brightness-110"
                  onClick={() => setIsAddOpen(false)}
                >
                  Adicionar colaborador
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
