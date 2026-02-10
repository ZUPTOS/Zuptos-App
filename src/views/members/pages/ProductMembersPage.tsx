"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import PaginatedTable, { type Column } from "@/shared/components/PaginatedTable";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/shared/ui/notification-toast";
import { productApi } from "@/lib/api";
import { ArrowLeft, Eye, Image as ImageIcon, LayoutGrid, MoreHorizontal, Trash2, X } from "lucide-react";
import { listMembersProducts } from "../requests/members.api";
import type { MembersProduct } from "../types/members.types";

type ProductMembersPageProps = {
  areaId: string;
};

type ProductRow = {
  id: string;
  items: MembersProduct[];
};

const tabs = ["Produtos", "Alunos", "Configurações", "Personalização"] as const;
const SEARCH_DEBOUNCE_MS = 300;
const MAX_LAYOUT_FILE_BYTES = 2 * 1024 * 1024; // 2MB

type ImportableProduct = {
  id: string;
  name: string;
};

type MembersStudent = {
  id: string;
  name: string;
  email: string;
  lastAccess: string;
  products: Array<{ id: string; name: string }>;
  progressPercent: number;
  completed: boolean;
  active: boolean;
};

const extractAreaSeed = (id: string) => {
  const match = id.match(/(\d+)$/);
  const parsed = match ? Number(match[1]) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const mockStudentFirstNames = [
  "Ana",
  "Bruno",
  "Carla",
  "Diego",
  "Eduarda",
  "Felipe",
  "Giovana",
  "Henrique",
  "Isabela",
  "Joao",
  "Karen",
  "Lucas",
  "Marina",
  "Nicolas",
  "Olivia",
  "Paulo",
  "Rafaela",
  "Sofia",
  "Thiago",
  "Vitoria",
];

const mockStudentLastNames = [
  "Almeida",
  "Barbosa",
  "Cardoso",
  "Dias",
  "Ferreira",
  "Gomes",
  "Lima",
  "Martins",
  "Melo",
  "Moreira",
  "Nunes",
  "Oliveira",
  "Pereira",
  "Ribeiro",
  "Rodrigues",
  "Santana",
  "Silva",
  "Souza",
  "Teixeira",
  "Vieira",
];

const mockStudentProducts = [
  { id: "m-1", name: "Gestão de Tráfego 1" },
  { id: "m-2", name: "Funil de Conversão 2" },
  { id: "m-3", name: "Acelerador de Vendas 3" },
  { id: "m-4", name: "Copy para Oferta 4" },
];

const buildMockStudentsByArea = (id: string, total = 505): MembersStudent[] => {
  const seed = extractAreaSeed(id);
  return Array.from({ length: total }, (_, index) => {
    const position = index + 1;
    const firstName = mockStudentFirstNames[(seed + index) % mockStudentFirstNames.length];
    const lastName = mockStudentLastNames[(seed * 3 + index) % mockStudentLastNames.length];
    const progressPercent = (seed * 17 + index * 7) % 101;
    const completed = progressPercent >= 100;
    const active = (seed + index) % 7 !== 0;
    const day = ((seed + index) % 28) + 1;
    const month = ((seed + Math.floor(index / 28)) % 12) + 1;

    const productsCount = ((seed + index) % 4) + 1;
    const products = Array.from({ length: productsCount }, (_, productIndex) => {
      const product = mockStudentProducts[(seed + index + productIndex) % mockStudentProducts.length];
      return { ...product };
    });

    return {
      id: `${id}-student-${position}`,
      name: `${firstName} ${lastName}`,
      email: `aluno${seed}-${position}@email.com`,
      lastAccess: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/2026`,
      products,
      progressPercent,
      completed,
      active,
    };
  });
};

const buildRows = (products: MembersProduct[], perRow = 3): ProductRow[] => {
  const rows: ProductRow[] = [];
  for (let index = 0; index < products.length; index += perRow) {
    rows.push({
      id: `row-${index}`,
      items: products.slice(index, index + perRow),
    });
  }
  return rows;
};

export default function ProductMembersPage({ areaId }: ProductMembersPageProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Produtos");
  const [searchValue, setSearchValue] = useState("");
  const [products, setProducts] = useState<MembersProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importOptions, setImportOptions] = useState<ImportableProduct[]>([]);
  const [isImportOptionsLoading, setIsImportOptionsLoading] = useState(false);
  const [importProductId, setImportProductId] = useState<string>("");

  const [layoutProduct, setLayoutProduct] = useState<MembersProduct | null>(null);
  const [layoutCoverFile, setLayoutCoverFile] = useState<File | null>(null);
  const [layoutCoverPreviewUrl, setLayoutCoverPreviewUrl] = useState<string | null>(null);
  const [layoutBannerFile, setLayoutBannerFile] = useState<File | null>(null);
  const [layoutBannerPreviewUrl, setLayoutBannerPreviewUrl] = useState<string | null>(null);

  const [removeProduct, setRemoveProduct] = useState<MembersProduct | null>(null);

  const [students, setStudents] = useState<MembersStudent[]>(() => buildMockStudentsByArea(areaId));
  const [resendAccessStudent, setResendAccessStudent] = useState<MembersStudent | null>(null);
  const [removeAccessStudent, setRemoveAccessStudent] = useState<MembersStudent | null>(null);
  const [passwordStudent, setPasswordStudent] = useState<MembersStudent | null>(null);
  const [editStudent, setEditStudent] = useState<MembersStudent | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [editStudentName, setEditStudentName] = useState("");
  const [editStudentEmail, setEditStudentEmail] = useState("");
  const [editStudentActive, setEditStudentActive] = useState(true);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const userName = useMemo(
    () => user?.fullName || user?.username || "Zuptos",
    [user]
  );

  useEffect(() => {
    setStudents(buildMockStudentsByArea(areaId));
  }, [areaId]);

  useEffect(() => {
    if (!passwordStudent) {
      setNewPassword("");
      setNewPasswordConfirm("");
      return;
    }

    setNewPassword("");
    setNewPasswordConfirm("");
  }, [passwordStudent]);

  useEffect(() => {
    if (!editStudent) {
      setEditStudentName("");
      setEditStudentEmail("");
      setEditStudentActive(true);
      return;
    }

    setEditStudentName(editStudent.name);
    setEditStudentEmail(editStudent.email);
    setEditStudentActive(editStudent.active);
  }, [editStudent]);

  const handleImportModalOpenChange = (open: boolean) => {
    setIsImportModalOpen(open);
    if (!open) {
      setImportProductId("");
      setImportOptions([]);
    }
  };

  const closeMenu = () => setOpenMenuId(null);

  useEffect(() => {
    if (!isImportModalOpen) return;

    let isActive = true;
    setIsImportOptionsLoading(true);

    const load = async () => {
      try {
        const response = await productApi.listProducts({ page: 1, limit: 10 }, token ?? undefined);
        if (!isActive) return;
        setImportOptions(response.map((item) => ({ id: item.id, name: item.name })));
      } catch (error) {
        console.error("Erro ao carregar produtos para importação:", error);
        if (!isActive) return;
        // fallback to the current area products so the modal isn't empty in dev
        setImportOptions(products.map((item) => ({ id: item.id, name: item.name })));
      } finally {
        if (!isActive) return;
        setIsImportOptionsLoading(false);
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [isImportModalOpen, products, token]);

  useEffect(() => {
    if (!layoutCoverFile) {
      setLayoutCoverPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(layoutCoverFile);
    setLayoutCoverPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [layoutCoverFile]);

  useEffect(() => {
    if (!layoutBannerFile) {
      setLayoutBannerPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(layoutBannerFile);
    setLayoutBannerPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [layoutBannerFile]);

  useEffect(() => {
    if (activeTab !== "Produtos") return;

    let isActive = true;
    setIsLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const response = await listMembersProducts(areaId, 1, searchValue);
        if (!isActive) return;
        setProducts(response.data);
      } catch (error) {
        console.error("Erro ao carregar produtos da área de membros:", error);
        if (!isActive) return;
        setProducts([]);
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [activeTab, areaId, searchValue]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-members-menu="true"]')) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const rows = useMemo(() => buildRows(products), [products]);
  const hasProducts = products.length > 0;

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) return students;

    return students.filter((student) =>
      [student.name, student.email].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      )
    );
  }, [students, searchValue]);

  const studentStats = useMemo(() => {
    if (filteredStudents.length === 0) {
      return { active: 0, averageProgress: 0, completionPercent: 0 };
    }

    const active = filteredStudents.filter((student) => student.active).length;
    const progressSum = filteredStudents.reduce(
      (sum, student) => sum + student.progressPercent,
      0
    );
    const averageProgress = Math.round(progressSum / filteredStudents.length);
    const completed = filteredStudents.filter((student) => student.completed).length;
    const completionPercent = Math.round(
      (completed / filteredStudents.length) * 100
    );

    return { active, averageProgress, completionPercent };
  }, [filteredStudents]);

  const studentColumns: Column<MembersStudent>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Nome",
        render: (student) => (
          <span className="font-semibold text-foreground">{student.name}</span>
        ),
      },
      {
        id: "email",
        header: "E-mail",
        render: (student) => (
          <span className="text-muted-foreground">{student.email}</span>
        ),
      },
      {
        id: "lastAccess",
        header: "Último acesso",
        render: (student) => (
          <span className="text-muted-foreground">{student.lastAccess}</span>
        ),
      },
      {
        id: "products",
        header: "Produtos",
        render: (student) => {
          const visible = student.products.slice(0, 3);
          const extraCount = Math.max(0, student.products.length - visible.length);

          return (
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1.5">
                {visible.map((product) => (
                  <span
                    key={product.id}
                    className="h-4 w-4 rounded-full border border-foreground/10 bg-muted-foreground/40"
                    title={product.name}
                    aria-label={product.name}
                  />
                ))}
                {extraCount > 0 ? (
                  <span
                    className="flex h-4 min-w-4 items-center justify-center rounded-full border border-foreground/10 bg-card px-1 text-[10px] text-muted-foreground"
                    aria-label={`Mais ${extraCount} produtos`}
                  >
                    +{extraCount}
                  </span>
                ) : null}
              </div>
              <span className="text-xs text-muted-foreground">
                {student.products.length} produto
                {student.products.length === 1 ? "" : "s"}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        headerClassName: "text-right",
        cellClassName: "text-right",
        width: "72px",
        render: (student) => {
          const isMenuOpen = openMenuId === student.id;
          return (
            <div className="relative flex justify-end" data-members-menu="true">
              <button
                type="button"
                onClick={() =>
                  setOpenMenuId((current) =>
                    current === student.id ? null : student.id
                  )
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-border bg-background text-muted-foreground transition hover:text-foreground"
                aria-label="Abrir menu do aluno"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

	              {isMenuOpen ? (
	                <div className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[220px] rounded-[6px] border border-foreground/10 bg-card p-2 shadow-lg">
	                  <button
	                    type="button"
	                    onClick={() => {
	                      setOpenMenuId(null);
	                      setResendAccessStudent(student);
	                    }}
	                    className="flex w-full items-center rounded-[4px] px-2 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
	                  >
	                    Reenviar email de acesso
	                  </button>
	                  <button
	                    type="button"
	                    onClick={() => {
	                      setOpenMenuId(null);
	                      setPasswordStudent(student);
	                    }}
	                    className="flex w-full items-center rounded-[4px] px-2 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
	                  >
	                    Criar nova senha
	                  </button>
	                  <button
	                    type="button"
	                    onClick={() => {
	                      setOpenMenuId(null);
	                      setEditStudent(student);
	                    }}
	                    className="flex w-full items-center rounded-[4px] px-2 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
	                  >
	                    Editar aluno
	                  </button>
	                  <button
	                    type="button"
	                    onClick={() => {
	                      setOpenMenuId(null);
	                      setRemoveAccessStudent(student);
	                    }}
	                    className="flex w-full items-center rounded-[4px] px-2 py-2 text-left text-[12px] text-red-300 transition hover:bg-red-500/10"
	                  >
	                    Remover acesso
                  </button>
                </div>
              ) : null}
            </div>
          );
        },
      },
    ],
    [openMenuId]
  );

  const columns: Column<ProductRow>[] = useMemo(
    () =>
      Array.from({ length: 3 }, (_, columnIndex) => ({
        id: `col-${columnIndex}`,
        header: "",
        cellClassName: "align-top !px-0 !py-0",
        render: (row) => {
          const product = row.items[columnIndex];
          if (!product) {
            return <div className="h-full min-h-[190px]" />;
          }

          const modulesLabel = `${product.modulesCount ?? 0} módulos`;
          const isMenuOpen = openMenuId === product.id;

          return (
            <article className="relative flex min-h-[190px] flex-col rounded-[4px] border border-border bg-card">
              <div className="h-[140px] bg-muted/70" aria-hidden="true" />
              <div className="flex flex-1 items-center justify-between gap-3 p-3.5">
                <div>
                  <p className="text-[14px] font-semibold text-foreground">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {modulesLabel}
                  </p>
                </div>

                <div className="relative" data-members-menu="true">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId((current) =>
                        current === product.id ? null : product.id
                      )
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-border bg-background text-muted-foreground transition hover:text-foreground"
                    aria-label="Abrir menu do produto"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[160px] rounded-[6px] border border-foreground/10 bg-card p-2 shadow-lg">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-[4px] px-2 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Pré-visualizar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          closeMenu();
                          setLayoutProduct(product);
                          setLayoutCoverFile(null);
                          setLayoutBannerFile(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-[4px] px-2 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Layout
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          closeMenu();
                          setRemoveProduct(product);
                        }}
                        className="flex w-full items-center gap-2 rounded-[4px] px-2 py-2 text-left text-[12px] text-red-300 transition hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        },
      })),
    [openMenuId]
  );

  return (
    <DashboardLayout userName={userName} userLocation="RJ" pageTitle="Área de membros">
      <section className="min-h-full bg-background px-5 py-6 pb-9 text-foreground sm:px-8">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-[320px]">
              <span
                className="absolute left-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-sm bg-muted-foreground/60"
                aria-hidden="true"
              />
	              <input
	                className="h-10 w-full rounded-[4px] border border-border bg-card px-4 pl-10 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
	                type="search"
	                placeholder="Buscar"
	                aria-label={activeTab === "Alunos" ? "Buscar alunos" : "Buscar produtos"}
	                value={searchValue}
	                onChange={(event) => setSearchValue(event.target.value)}
	              />
	            </div>
	
	            {activeTab === "Produtos" ? (
	              <button
	                type="button"
	                onClick={() => {
	                  closeMenu();
	                  setIsImportModalOpen(true);
	                }}
	                className="h-9 rounded-[8px] border border-foreground/10 bg-card px-4 text-[12px] text-muted-foreground transition hover:text-foreground"
	              >
	                Importar produto
	              </button>
	            ) : activeTab === "Alunos" ? (
	              <button
	                type="button"
	                onClick={() => notify.warning("Em breve", "A criação manual de aluno será implementada.")}
	                className="h-9 rounded-[8px] border border-foreground/10 bg-card px-4 text-[12px] text-muted-foreground transition hover:text-foreground"
	              >
	                Adicionar aluno
	              </button>
	            ) : null}
	          </div>

          <div className="mt-5 flex flex-wrap items-center gap-5">
            {tabs.map((tab) => {
              const isActive = tab === activeTab;
              return (
	                <button
	                  key={tab}
	                  type="button"
	                  onClick={() => {
	                    closeMenu();
	                    setActiveTab(tab);
	                  }}
	                  className={`text-sm font-semibold transition ${
	                    isActive
	                      ? "text-primary"
	                      : "text-muted-foreground hover:text-foreground"
	                  }`}
                >
                  <span className="relative pb-2">
                    {tab}
                    {isActive && (
                      <span className="absolute left-0 top-full h-[2px] w-full rounded-full bg-primary" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

	          {activeTab === "Produtos" ? (
	            <div className="mt-6">
	              <PaginatedTable<ProductRow>
	                data={rows}
	                columns={columns}
                rowKey={(row) => row.id}
                rowsPerPage={2}
                isLoading={isLoading}
                loadingRows={2}
                emptyMessage={hasProducts ? "" : "Nenhum produto encontrado."}
                tableContainerClassName="border-0 bg-transparent"
                tableClassName="border-separate border-spacing-4 text-left"
                headerRowClassName="hidden"
	                paginationContainerClassName="mt-4"
	              />
	            </div>
	          ) : activeTab === "Alunos" ? (
	            <div className="mt-6 space-y-6">
	              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
	                <div className="rounded-[8px] border border-foreground/10 bg-card p-6">
	                  <p className="text-xs text-muted-foreground">Número de alunos ativos</p>
	                  <p className="mt-3 text-2xl font-semibold text-foreground">
	                    {String(studentStats.active).padStart(2, "0")}
	                  </p>
	                </div>
	
	                <div className="rounded-[8px] border border-foreground/10 bg-card p-6">
	                  <p className="text-xs text-muted-foreground">Progresso</p>
	                  <p className="mt-2 text-2xl font-semibold text-foreground">
	                    {String(studentStats.averageProgress).padStart(2, "0")}%
	                  </p>
	                  <p className="mt-1 text-xs text-muted-foreground">Média dos usuários</p>
	                </div>
	
	                <div className="rounded-[8px] border border-foreground/10 bg-card p-6">
	                  <p className="text-xs text-muted-foreground">Conclusão</p>
	                  <p className="mt-2 text-2xl font-semibold text-foreground">
	                    {String(studentStats.completionPercent).padStart(2, "0")}%
	                  </p>
	                  <p className="mt-1 text-xs text-muted-foreground">Concluíram o curso</p>
	                </div>
	              </div>
	
	              <PaginatedTable<MembersStudent>
	                data={filteredStudents}
	                columns={studentColumns}
	                rowKey={(row) => row.id}
	                rowsPerPage={5}
	                emptyMessage="Nenhum aluno encontrado."
	                tableClassName="text-left"
	                paginationContainerClassName="mt-4"
	              />
	            </div>
	          ) : (
	            <div className="mt-6 rounded-[8px] border border-dashed border-foreground/10 px-6 py-10 text-sm text-muted-foreground">
	              Em breve.
	            </div>
          )}

          <button
            type="button"
            className="mt-6 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/members")}
          >
            Voltar para áreas de membros
          </button>
        </div>
      </section>

      <Dialog
        open={isImportModalOpen}
        onOpenChange={handleImportModalOpenChange}
      >
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-[520px] rounded-[6px] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-8"
          showCloseButton={false}
        >
          <div className="flex items-start justify-between gap-6">
            <DialogTitle className="text-2xl font-semibold text-white sm:text-3xl">
              Importar produto
            </DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-[4px] p-2 text-zinc-500 transition hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />

          <div className="mt-5 space-y-3">
            <label className="text-base font-semibold text-white">Nome do produto</label>

            <Select value={importProductId} onValueChange={setImportProductId}>
              <SelectTrigger className="mt-2 h-11 w-full rounded-[6px] border border-white/10 bg-[#141414] px-4 text-sm text-white shadow-none focus:ring-2 focus:ring-primary/40">
                <SelectValue placeholder="Insira o nome" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#141414] text-white">
                {isImportOptionsLoading ? (
                  <SelectItem value="__loading" disabled>
                    Carregando...
                  </SelectItem>
                ) : importOptions.length > 0 ? (
                  importOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty" disabled>
                    Nenhum produto encontrado
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            disabled={!importProductId || importProductId === "__loading" || importProductId === "__empty"}
            className="mt-6 h-12 w-full rounded-[6px] bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              const selected = importOptions.find((item) => item.id === importProductId);
              if (!selected) return;

              setProducts((current) => {
                const exists = current.some((item) => item.id === selected.id);
                if (exists) return current;
                return [
                  {
                    id: selected.id,
                    areaId,
                    name: selected.name,
                    modulesCount: 0,
                  },
                  ...current,
                ];
              });

              notify.success("Produto importado", "O produto foi adicionado a área de membros.");
              handleImportModalOpenChange(false);
            }}
          >
            Importar
          </button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(layoutProduct)}
        onOpenChange={(open) => {
          if (open) return;
          setLayoutProduct(null);
          setLayoutCoverFile(null);
          setLayoutBannerFile(null);
        }}
      >
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-[560px] rounded-[6px] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-8"
          showCloseButton={false}
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-[6px] p-2 text-zinc-300 transition hover:bg-white/5 hover:text-white"
                aria-label="Voltar"
                onClick={() => setLayoutProduct(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <DialogTitle className="text-2xl font-semibold text-white">
                Layout
              </DialogTitle>
            </div>

            <DialogClose asChild>
              <button
                type="button"
                className="rounded-[4px] p-2 text-zinc-500 transition hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />

          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">Capa do curso</h3>
              <p className="text-xs leading-relaxed text-white/60">
                Esta será a imagem que aparecerá nas seções do tipo &quot;curso&quot; da sua área de membros.
              </p>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (!file) {
                    setLayoutCoverFile(null);
                    return;
                  }
                  if (file.size > MAX_LAYOUT_FILE_BYTES) {
                    notify.error("Arquivo muito grande", "Envie uma imagem de até 2MB.");
                    event.target.value = "";
                    return;
                  }
                  setLayoutCoverFile(file);
                }}
              />

              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="relative flex h-[150px] w-full items-center justify-center overflow-hidden rounded-[8px] border border-white/10 bg-[#2a2a2a] text-center text-xs text-white/50 transition hover:border-white/20"
              >
                {layoutCoverPreviewUrl ? (
                  <span
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${layoutCoverPreviewUrl})` }}
                    aria-label={layoutCoverFile?.name ?? "Capa selecionada"}
                  />
                ) : null}
                <span className="relative flex flex-col items-center gap-2 px-4">
                  <ImageIcon className="h-10 w-10 text-white/30" />
                  <span>
                    Selecione do computador
                    <br />
                    ou arraste/solte aqui
                  </span>
                  <span className="text-[10px] text-white/35">
                    JPEG, JPG, PNG, WEBP até 2 MB
                  </span>
                  {layoutCoverFile ? (
                    <span className="mt-1 text-[10px] font-semibold text-white/70">
                      {layoutCoverFile.name}
                    </span>
                  ) : null}
                </span>
              </button>

              <p className="text-xs text-white/60">Tamanho recomendado: 450x160 pixels</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">Banner do curso</h3>
              <p className="text-xs leading-relaxed text-white/60">
                Esta será a imagem que aparecerá no topo da página do curso.
              </p>

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (!file) {
                    setLayoutBannerFile(null);
                    return;
                  }
                  if (file.size > MAX_LAYOUT_FILE_BYTES) {
                    notify.error("Arquivo muito grande", "Envie uma imagem de até 2MB.");
                    event.target.value = "";
                    return;
                  }
                  setLayoutBannerFile(file);
                }}
              />

              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="relative flex h-[150px] w-full items-center justify-center overflow-hidden rounded-[8px] border border-white/10 bg-[#2a2a2a] text-center text-xs text-white/50 transition hover:border-white/20"
              >
                {layoutBannerPreviewUrl ? (
                  <span
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${layoutBannerPreviewUrl})` }}
                    aria-label={layoutBannerFile?.name ?? "Banner selecionado"}
                  />
                ) : null}
                <span className="relative flex flex-col items-center gap-2 px-4">
                  <ImageIcon className="h-10 w-10 text-white/30" />
                  <span>
                    Selecione do computador
                    <br />
                    ou arraste/solte aqui
                  </span>
                  <span className="text-[10px] text-white/35">
                    JPEG, JPG, PNG, WEBP até 2 MB
                  </span>
                  {layoutBannerFile ? (
                    <span className="mt-1 text-[10px] font-semibold text-white/70">
                      {layoutBannerFile.name}
                    </span>
                  ) : null}
                </span>
              </button>

              <p className="text-xs text-white/60">Tamanho recomendado: 1348x581 pixels</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              className="h-10 rounded-[6px] bg-white/10 px-5 text-xs font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
              onClick={() => setLayoutProduct(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="h-10 rounded-[6px] bg-primary px-5 text-xs font-semibold text-primary-foreground transition hover:brightness-105"
              onClick={() => {
                notify.success("Layout atualizado", "As imagens do curso foram atualizadas.");
                setLayoutProduct(null);
              }}
            >
              Atualizar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(removeProduct)}
        onOpenChange={(open) => {
          if (open) return;
          setRemoveProduct(null);
        }}
      >
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-[560px] rounded-[6px] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-8"
          showCloseButton={false}
        >
          <div className="flex items-start justify-between gap-6">
            <DialogTitle className="text-2xl font-semibold text-white">
              Remover produto
            </DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-[4px] p-2 text-zinc-500 transition hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />

          <p className="mt-5 text-sm text-white/80">
            Você tem certeza que quer remover o produto{removeProduct?.name ? ` “${removeProduct.name}”` : ""}?
          </p>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              className="h-10 min-w-[140px] rounded-[6px] bg-white/10 px-5 text-xs font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
              onClick={() => setRemoveProduct(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="h-10 min-w-[140px] rounded-[6px] bg-primary px-5 text-xs font-semibold text-primary-foreground transition hover:brightness-105"
              onClick={() => {
                if (!removeProduct) return;
                setProducts((current) => current.filter((item) => item.id !== removeProduct.id));
                notify.success("Produto removido", "O produto foi removido da área de membros.");
                setRemoveProduct(null);
              }}
            >
              Sim, remover
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(resendAccessStudent)}
        onOpenChange={(open) => {
          if (open) return;
          setResendAccessStudent(null);
        }}
      >
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-[560px] rounded-[6px] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-8"
          showCloseButton={false}
        >
          <div className="flex items-start justify-between gap-6">
            <DialogTitle className="text-2xl font-semibold text-white">
              Reenviar email de acesso
            </DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-[4px] p-2 text-zinc-500 transition hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />

          <p className="mt-5 text-sm text-white/80">
            Você tem certeza que quer reenviar o email?
          </p>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              className="h-10 min-w-[140px] rounded-[6px] bg-white/10 px-5 text-xs font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
              onClick={() => setResendAccessStudent(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="h-10 min-w-[140px] rounded-[6px] bg-primary px-5 text-xs font-semibold text-primary-foreground transition hover:brightness-105"
              onClick={() => {
                if (!resendAccessStudent) return;
                notify.success(
                  "Email reenviado",
                  `Um novo email de acesso foi enviado para ${resendAccessStudent.email}.`
                );
                setResendAccessStudent(null);
              }}
            >
              Sim, Reenviar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(removeAccessStudent)}
        onOpenChange={(open) => {
          if (open) return;
          setRemoveAccessStudent(null);
        }}
      >
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-[620px] rounded-[6px] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-8"
          showCloseButton={false}
        >
          <div className="flex items-start justify-between gap-6">
            <DialogTitle className="text-2xl font-semibold text-white">
              Remover acesso
            </DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-[4px] p-2 text-zinc-500 transition hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />

          <p className="mt-5 text-sm text-white/80">
            Você tem certeza que quer remover o acesso à área de membros completa e de todos produtos comprados?
          </p>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              className="h-10 min-w-[140px] rounded-[6px] bg-white/10 px-5 text-xs font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
              onClick={() => setRemoveAccessStudent(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="h-10 min-w-[140px] rounded-[6px] bg-primary px-5 text-xs font-semibold text-primary-foreground transition hover:brightness-105"
              onClick={() => {
                if (!removeAccessStudent) return;
                setStudents((current) =>
                  current.filter((item) => item.id !== removeAccessStudent.id)
                );
                notify.success(
                  "Acesso removido",
                  `${removeAccessStudent.name} não tem mais acesso ao produto.`
                );
                setRemoveAccessStudent(null);
              }}
            >
              Sim, remover
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(passwordStudent)}
        onOpenChange={(open) => {
          if (open) return;
          setPasswordStudent(null);
        }}
      >
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-[560px] rounded-[6px] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-8"
          showCloseButton={false}
        >
          <div className="flex items-start justify-between gap-6">
            <DialogTitle className="text-2xl font-semibold text-white">
              Criar nova senha
            </DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-[4px] p-2 text-zinc-500 transition hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />

          <div className="mt-5 space-y-5">
            <div className="space-y-2">
              <label className="text-base font-semibold text-white">Nova senha</label>
              <input
                type="password"
                placeholder="senha"
                className="h-11 w-full rounded-[6px] border border-white/10 bg-[#141414] px-4 text-sm text-white shadow-none placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-base font-semibold text-white">Confirmar nova senha</label>
              <input
                type="password"
                placeholder="senha"
                className="h-11 w-full rounded-[6px] border border-white/10 bg-[#141414] px-4 text-sm text-white shadow-none placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                value={newPasswordConfirm}
                onChange={(event) => setNewPasswordConfirm(event.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className="mt-8 h-12 w-full rounded-[6px] bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!newPassword || newPassword !== newPasswordConfirm}
            onClick={() => {
              if (!passwordStudent) return;
              if (!newPassword || newPassword !== newPasswordConfirm) {
                notify.error("Senha inválida", "As senhas precisam ser iguais.");
                return;
              }

              notify.success(
                "Senha atualizada",
                `A senha de ${passwordStudent.email} foi atualizada.`
              );
              setPasswordStudent(null);
            }}
          >
            Salvar
          </button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editStudent)}
        onOpenChange={(open) => {
          if (open) return;
          setEditStudent(null);
        }}
      >
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-[740px] max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[6px] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-8"
          showCloseButton={false}
        >
          <div className="flex items-start justify-between gap-6">
            <DialogTitle className="text-2xl font-semibold text-white">
              Editar aluno
            </DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-[4px] p-2 text-zinc-500 transition hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />

          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/60">Nome</span>
                <span className="font-semibold text-white">{editStudentName}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/60">Turma</span>
                <span className="font-semibold text-white/80">Turma 01</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/60">Inclusão</span>
                <span className="font-semibold text-white/80">dd/mm/aaaa</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/60">Último acesso</span>
                <span className="font-semibold text-white/80">{editStudent?.lastAccess ?? "dd/mm/aaaa"}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/60">Progresso</span>
                <div className="flex w-[220px] items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-white/10">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${editStudent?.progressPercent ?? 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white/80">
                    {String(editStudent?.progressPercent ?? 0).padStart(2, "0")}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-base font-semibold text-white">E-mail</label>
              <input
                type="email"
                placeholder="email@email.com"
                className="h-11 w-full rounded-[6px] border border-white/10 bg-[#141414] px-4 text-sm text-white shadow-none placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                value={editStudentEmail}
                onChange={(event) => setEditStudentEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-base font-semibold text-white">Status</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setEditStudentActive(true)}
                  className={`h-10 min-w-[140px] rounded-[6px] px-5 text-xs font-semibold transition ${
                    editStudentActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/10 text-white/70 hover:bg-white/15"
                  }`}
                >
                  Ativo
                </button>
                <button
                  type="button"
                  onClick={() => setEditStudentActive(false)}
                  className={`h-10 min-w-[140px] rounded-[6px] px-5 text-xs font-semibold transition ${
                    editStudentActive
                      ? "bg-white/10 text-white/70 hover:bg-white/15"
                      : "bg-white/15 text-white"
                  }`}
                >
                  Bloquear aluno
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-base font-semibold text-white">Produtos</p>
              <div className="rounded-[8px] border border-white/10 bg-[#141414] p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[8px] bg-primary/20" aria-hidden="true" />
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-white">
                      {editStudent?.products?.[0]?.name ?? "Produto 01"}
                    </p>
                    <p className="text-xs text-white/50">Curso</p>
                  </div>
                  <p className="ml-auto text-sm font-semibold text-white/80">R$ 497,00</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-base font-semibold text-white">Adicionar produtos</p>
              <button
                type="button"
                onClick={() => notify.warning("Em breve", "A adição de produtos será implementada.")}
                className="h-11 w-full rounded-[6px] border border-white/10 bg-[#141414] px-4 text-left text-sm text-white/60 transition hover:border-white/20"
              >
                Produto 01
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="h-10 min-w-[140px] rounded-[6px] bg-white/10 px-5 text-xs font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
                onClick={() => setEditStudent(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="h-10 min-w-[140px] rounded-[6px] bg-primary px-5 text-xs font-semibold text-primary-foreground transition hover:brightness-105"
                onClick={() => {
                  if (!editStudent) return;

                  setStudents((current) =>
                    current.map((item) =>
                      item.id === editStudent.id
                        ? {
                            ...item,
                            name: editStudentName.trim() || item.name,
                            email: editStudentEmail.trim() || item.email,
                            active: editStudentActive,
                          }
                        : item
                    )
                  );
                  notify.success("Aluno atualizado", "As informações do aluno foram atualizadas.");
                  setEditStudent(null);
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
