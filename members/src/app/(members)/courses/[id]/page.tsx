import { getCourse } from "@/lib/data";
import styles from "@/styles/ui.module.css";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourse(id);

  return (
    <div className={styles.stack}>
      <section className={styles.card}>
        <div className={styles.cardTitle}>
          <span>{course.title}</span>
          <span className={styles.pill}>{course.progress}% completo</span>
        </div>
        <p className={styles.muted}>{course.description}</p>
        <div className={styles.progress}>
          <div
            className={styles.progressBar}
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardTitle}>
          <span>Modulos</span>
          <span className={styles.pill}>{course.totalLessons} aulas</span>
        </div>
        <div className={styles.list}>
          {course.modules.map((module) => (
            <div className={styles.listItem} key={module.id}>
              <div>
                <div className={styles.courseTitle}>{module.title}</div>
                <div className={styles.muted}>{module.duration}</div>
              </div>
              <span className={styles.pill}>{module.lessons} aulas</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
