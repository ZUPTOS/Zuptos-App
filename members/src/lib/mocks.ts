export type MemberProfile = {
  id: string;
  name: string;
  email: string;
  plan: string;
  joinedAt: string;
  lastAccess: string;
};

export type MemberCourse = {
  id: string;
  title: string;
  progress: number;
  status: "active" | "completed" | "paused";
  lastAccess: string;
  nextLesson: string;
};

export type CourseModule = {
  id: string;
  title: string;
  lessons: number;
  duration: string;
};

export type CourseDetail = {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  modules: CourseModule[];
};

export const mockProfile = (): MemberProfile => ({
  id: "member_013",
  name: "Camila Duarte",
  email: "camila@example.com",
  plan: "Plano Membros Pro",
  joinedAt: "2024-05-14",
  lastAccess: "2025-01-18",
});

export const mockMyCourses = (): MemberCourse[] => [
  {
    id: "storytelling-101",
    title: "Storytelling para Lancamentos",
    progress: 62,
    status: "active",
    lastAccess: "2025-01-17",
    nextLesson: "Modulo 4: Aberturas"
  },
  {
    id: "community-ops",
    title: "Community Ops na Pratica",
    progress: 28,
    status: "active",
    lastAccess: "2025-01-10",
    nextLesson: "Modulo 2: Rotinas"
  },
  {
    id: "analytics-boost",
    title: "Metricas para Escalar",
    progress: 100,
    status: "completed",
    lastAccess: "2024-12-20",
    nextLesson: "Curso concluido"
  }
];

export const mockCourse = (id: string): CourseDetail => {
  const base = mockMyCourses().find((course) => course.id === id) ?? mockMyCourses()[0];

  return {
    id: base.id,
    title: base.title,
    description:
      "Conteudo introdutorio com entregaveis semanais, templates e sessoes ao vivo.",
    progress: base.progress,
    totalLessons: 18,
    modules: [
      {
        id: "m1",
        title: "Boas-vindas e roteiro",
        lessons: 4,
        duration: "38 min"
      },
      {
        id: "m2",
        title: "Estudo de caso guiado",
        lessons: 6,
        duration: "1h 12m"
      },
      {
        id: "m3",
        title: "Aplicacao e ajustes",
        lessons: 8,
        duration: "1h 40m"
      }
    ]
  };
};
