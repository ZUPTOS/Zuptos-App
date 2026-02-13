import { useEffect, useMemo, useState } from "react";
import { buildMockStudentsByArea } from "../mocks/students";
import type { MembersStudent } from "../types";

type MembersStudentStats = {
  active: number;
  averageProgress: number;
  completionPercent: number;
};

type UseMembersStudentsParams = {
  areaId: string;
  searchValue: string;
};

export function useMembersStudents({ areaId, searchValue }: UseMembersStudentsParams) {
  const [students, setStudents] = useState<MembersStudent[]>(() => buildMockStudentsByArea(areaId));

  useEffect(() => {
    setStudents(buildMockStudentsByArea(areaId));
  }, [areaId]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) return students;

    return students.filter((student) =>
      [student.name, student.email].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      )
    );
  }, [students, searchValue]);

  const stats: MembersStudentStats = useMemo(() => {
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

  return { students, setStudents, filteredStudents, stats };
}

export type { MembersStudentStats };

