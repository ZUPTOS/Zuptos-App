import Link from "next/link";
import { getMyCourses, getProfile } from "@/lib/data";
import styles from "@/styles/ui.module.css";

const statusLabels: Record<string, string> = {
  active: "Em andamento",
  completed: "Concluido",
  paused: "Pausado",
};

export default async function DashboardPage() {
  const [profile, courses] = await Promise.all([getProfile(), getMyCourses()]);
  const isMock = process.env.NEXT_PUBLIC_MEMBERS_MOCK === "1";

  return (
    <div className={styles.stack}>
      <section className={styles.card}>
        <div className={styles.cardTitle}>
          <span>Bem-vinda, {profile.name}</span>
          {isMock ? <span className={styles.badge}>Mocks ativos</span> : null}
        </div>
        <p className={styles.muted}>
          Plano: {profile.plan} · Ultimo acesso: {profile.lastAccess}
        </p>
        <div className={styles.grid}>
          <div className={styles.listItem}>
            <span>Email</span>
            <span className={styles.muted}>{profile.email}</span>
          </div>
          <div className={styles.listItem}>
            <span>Entrada na area</span>
            <span className={styles.muted}>{profile.joinedAt}</span>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardTitle}>
          <span>Meus cursos</span>
          <span className={styles.pill}>{courses.length} ativos</span>
        </div>
        <div className={`${styles.grid} ${styles.courseGrid}`}>
          {courses.map((course) => (
            <article className={styles.courseItem} key={course.id}>
              <div className={styles.courseTitle}>{course.title}</div>
              <span className={styles.muted}>{course.nextLesson}</span>
              <span className={styles.badge}>{statusLabels[course.status]}</span>
              <div className={styles.progress}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <span className={styles.muted}>
                {course.progress}% completo
              </span>
              <Link className={styles.pill} href={`/courses/${course.id}`}>
                Ver conteudo
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
