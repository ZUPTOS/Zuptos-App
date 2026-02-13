import { useCallback, useState } from "react";
import { notify } from "@/shared/ui/notification-toast";
import type { MembersStudent } from "../types";

type UseStudentModalsParams = {
  setStudents: React.Dispatch<React.SetStateAction<MembersStudent[]>>;
};

export function useStudentModals({ setStudents }: UseStudentModalsParams) {
  const [resendAccessStudent, setResendAccessStudent] = useState<MembersStudent | null>(null);
  const [removeAccessStudent, setRemoveAccessStudent] = useState<MembersStudent | null>(null);
  const [passwordStudent, setPasswordStudent] = useState<MembersStudent | null>(null);
  const [editStudent, setEditStudent] = useState<MembersStudent | null>(null);

  const confirmResendAccess = useCallback(() => {
    if (!resendAccessStudent) return;
    notify.success(
      "Email reenviado",
      `Um novo email de acesso foi enviado para ${resendAccessStudent.email}.`
    );
    setResendAccessStudent(null);
  }, [resendAccessStudent]);

  const confirmRemoveAccess = useCallback(() => {
    if (!removeAccessStudent) return;

    setStudents((current) =>
      current.filter((item) => item.id !== removeAccessStudent.id)
    );
    notify.success(
      "Acesso removido",
      `${removeAccessStudent.name} não tem mais acesso ao produto.`
    );
    setRemoveAccessStudent(null);
  }, [removeAccessStudent, setStudents]);

  const savePassword = useCallback(
    (_password: string) => {
      if (!passwordStudent) return;
      if (!_password) return;
      notify.success("Senha atualizada", `A senha de ${passwordStudent.email} foi atualizada.`);
      setPasswordStudent(null);
    },
    [passwordStudent]
  );

  const saveEditStudent = useCallback(
    (next: { email: string; active: boolean }) => {
      if (!editStudent) return;

      setStudents((current) =>
        current.map((item) =>
          item.id === editStudent.id
            ? { ...item, email: next.email, active: next.active }
            : item
        )
      );
      notify.success("Aluno atualizado", "As informações do aluno foram atualizadas.");
      setEditStudent(null);
    },
    [editStudent, setStudents]
  );

  return {
    resendAccessModal: {
      student: resendAccessStudent,
      openModal: (student: MembersStudent) => setResendAccessStudent(student),
      closeModal: () => setResendAccessStudent(null),
      confirm: confirmResendAccess,
    },
    removeAccessModal: {
      student: removeAccessStudent,
      openModal: (student: MembersStudent) => setRemoveAccessStudent(student),
      closeModal: () => setRemoveAccessStudent(null),
      confirm: confirmRemoveAccess,
    },
    passwordModal: {
      student: passwordStudent,
      openModal: (student: MembersStudent) => setPasswordStudent(student),
      closeModal: () => setPasswordStudent(null),
      save: savePassword,
    },
    editModal: {
      student: editStudent,
      openModal: (student: MembersStudent) => setEditStudent(student),
      closeModal: () => setEditStudent(null),
      save: saveEditStudent,
    },
  };
}
