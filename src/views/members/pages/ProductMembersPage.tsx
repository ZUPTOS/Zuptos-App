"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/shared/ui/notification-toast";

import { tabs, type MembersTab } from "./product-members/constants";
import { useMembersProducts } from "./product-members/hooks/useMembersProducts";
import { useProductModals } from "./product-members/hooks/useProductModals";
import { useMembersStudents } from "./product-members/hooks/useMembersStudents";
import { useStudentModals } from "./product-members/hooks/useStudentModals";
import { useMembersSettings } from "./product-members/hooks/useMembersSettings";

import { ProductsTab } from "./product-members/tabs/ProductsTab";
import { StudentsTab } from "./product-members/tabs/StudentsTab";
import { SettingsTab } from "./product-members/tabs/SettingsTab";

import { ImportProductModal } from "./product-members/modals/ImportProductModal";
import { ProductLayoutModal } from "./product-members/modals/ProductLayoutModal";
import { RemoveProductModal } from "./product-members/modals/RemoveProductModal";
import { ResendAccessModal } from "./product-members/modals/ResendAccessModal";
import { RemoveAccessModal } from "./product-members/modals/RemoveAccessModal";
import { CreatePasswordModal } from "./product-members/modals/CreatePasswordModal";
import { EditStudentModal } from "./product-members/modals/EditStudentModal";

type ProductMembersPageProps = {
  areaId: string;
};

export default function ProductMembersPage({ areaId }: ProductMembersPageProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MembersTab>("Produtos");
  const [searchValue, setSearchValue] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const closeMenu = () => setOpenMenuId(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-members-menu="true"]')) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const productsState = useMembersProducts({
    areaId,
    searchValue,
    enabled: activeTab === "Produtos",
  });

  const productModals = useProductModals({
    areaId,
    token,
    products: productsState.products,
    setProducts: productsState.setProducts,
  });

  const studentsState = useMembersStudents({ areaId, searchValue });
  const studentModals = useStudentModals({ setStudents: studentsState.setStudents });
  const settingsState = useMembersSettings(areaId);

  const userName = useMemo(
    () => user?.fullName || user?.username || "Zuptos",
    [user]
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
                  productModals.importModal.openModal();
                }}
                className="h-9 rounded-[8px] border border-foreground/10 bg-card px-4 text-[12px] text-muted-foreground transition hover:text-foreground"
              >
                Importar produto
              </button>
            ) : activeTab === "Alunos" ? (
              <button
                type="button"
                onClick={() =>
                  notify.warning(
                    "Em breve",
                    "A criação manual de aluno será implementada."
                  )
                }
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
            <ProductsTab
              rows={productsState.rows}
              isLoading={productsState.isLoading}
              hasProducts={productsState.hasProducts}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onOpenLayout={productModals.layoutModal.openModal}
              onOpenRemove={productModals.removeModal.openModal}
              onSelectProduct={(product) => {
                closeMenu();
                router.push(
                  `/members/${encodeURIComponent(areaId)}/products/${encodeURIComponent(
                    product.id
                  )}`
                );
              }}
            />
          ) : activeTab === "Alunos" ? (
            <StudentsTab
              stats={studentsState.stats}
              students={studentsState.filteredStudents}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onResendAccess={studentModals.resendAccessModal.openModal}
              onCreatePassword={studentModals.passwordModal.openModal}
              onEditStudent={studentModals.editModal.openModal}
              onRemoveAccess={studentModals.removeAccessModal.openModal}
            />
          ) : activeTab === "Configurações" ? (
            <SettingsTab settings={settingsState.settings} onChange={settingsState.setSettings} />
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

      <ImportProductModal
        open={productModals.importModal.open}
        onOpenChange={productModals.importModal.onOpenChange}
        options={productModals.importModal.options}
        loading={productModals.importModal.loading}
        selectedId={productModals.importModal.selectedId}
        onSelectedIdChange={productModals.importModal.setSelectedId}
        onImport={productModals.importModal.onImport}
      />

      <ProductLayoutModal
        product={productModals.layoutModal.product}
        onClose={productModals.layoutModal.closeModal}
      />

      <RemoveProductModal
        product={productModals.removeModal.product}
        onClose={productModals.removeModal.closeModal}
        onConfirm={productModals.removeModal.confirmRemove}
      />

      <ResendAccessModal
        student={studentModals.resendAccessModal.student}
        onClose={studentModals.resendAccessModal.closeModal}
        onConfirm={studentModals.resendAccessModal.confirm}
      />

      <RemoveAccessModal
        student={studentModals.removeAccessModal.student}
        onClose={studentModals.removeAccessModal.closeModal}
        onConfirm={studentModals.removeAccessModal.confirm}
      />

      <CreatePasswordModal
        student={studentModals.passwordModal.student}
        onClose={studentModals.passwordModal.closeModal}
        onSave={studentModals.passwordModal.save}
      />

      <EditStudentModal
        student={studentModals.editModal.student}
        onClose={studentModals.editModal.closeModal}
        onSave={studentModals.editModal.save}
      />
    </DashboardLayout>
  );
}
