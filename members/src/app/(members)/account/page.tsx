import { getProfile } from "@/lib/data";
import styles from "@/styles/ui.module.css";

export default async function AccountPage() {
  const profile = await getProfile();

  return (
    <div className={styles.stack}>
      <section className={styles.card}>
        <div className={styles.cardTitle}>
          <span>Minha conta</span>
          <span className={styles.badge}>Placeholder</span>
        </div>
        <p className={styles.muted}>
          Esta area sera conectada ao backend de membros.
        </p>
      </section>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Dados basicos</h3>
        <div className={styles.list}>
          <div className={styles.listItem}>
            <span>Nome</span>
            <span className={styles.muted}>{profile.name}</span>
          </div>
          <div className={styles.listItem}>
            <span>Email</span>
            <span className={styles.muted}>{profile.email}</span>
          </div>
          <div className={styles.listItem}>
            <span>Plano</span>
            <span className={styles.muted}>{profile.plan}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
