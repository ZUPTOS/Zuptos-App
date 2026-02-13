"use client";

import { useMemo } from "react";
import PaginatedTable, { type Column } from "@/shared/components/PaginatedTable";
import { MoreHorizontal } from "lucide-react";
import type { MembersStudent } from "../types";
import type { MembersStudentStats } from "../hooks/useMembersStudents";

type StudentsTabProps = {
  stats: MembersStudentStats;
  students: MembersStudent[];
  openMenuId: string | null;
  setOpenMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  onResendAccess: (student: MembersStudent) => void;
  onCreatePassword: (student: MembersStudent) => void;
  onEditStudent: (student: MembersStudent) => void;
  onRemoveAccess: (student: MembersStudent) => void;
};

export function StudentsTab({
  stats,
  students,
  openMenuId,
  setOpenMenuId,
  onResendAccess,
  onCreatePassword,
  onEditStudent,
  onRemoveAccess,
}: StudentsTabProps) {
  const columns: Column<MembersStudent>[] = useMemo(
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
                {student.products.length} produto{student.products.length === 1 ? "" : "s"}
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
                      onResendAccess(student);
                    }}
                    className="flex w-full items-center rounded-[4px] px-2 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
                  >
                    Reenviar email de acesso
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuId(null);
                      onCreatePassword(student);
                    }}
                    className="flex w-full items-center rounded-[4px] px-2 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
                  >
                    Criar nova senha
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuId(null);
                      onEditStudent(student);
                    }}
                    className="flex w-full items-center rounded-[4px] px-2 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
                  >
                    Editar aluno
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuId(null);
                      onRemoveAccess(student);
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
    [onCreatePassword, onEditStudent, onRemoveAccess, onResendAccess, openMenuId, setOpenMenuId]
  );

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[8px] border border-foreground/10 bg-card p-6">
          <p className="text-xs text-muted-foreground">Número de alunos ativos</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {String(stats.active).padStart(2, "0")}
          </p>
        </div>

        <div className="rounded-[8px] border border-foreground/10 bg-card p-6">
          <p className="text-xs text-muted-foreground">Progresso</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {String(stats.averageProgress).padStart(2, "0")}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Média dos usuários</p>
        </div>

        <div className="rounded-[8px] border border-foreground/10 bg-card p-6">
          <p className="text-xs text-muted-foreground">Conclusão</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {String(stats.completionPercent).padStart(2, "0")}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Concluíram o curso</p>
        </div>
      </div>

      <PaginatedTable<MembersStudent>
        data={students}
        columns={columns}
        rowKey={(row) => row.id}
        rowsPerPage={5}
        emptyMessage="Nenhum aluno encontrado."
        tableClassName="text-left"
        paginationContainerClassName="mt-4"
      />
    </div>
  );
}

