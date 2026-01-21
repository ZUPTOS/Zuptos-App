import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import styles from "@/styles/ui.module.css";

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            Zuptos Members
            <span className={styles.brandSubtitle}>
              Area reservada para alunos
            </span>
          </div>
          <nav className={styles.nav}>
            <Link className={styles.navLink} href="/dashboard">
              Dashboard
            </Link>
            <Link className={styles.navLink} href="/account">
              Conta
            </Link>
          </nav>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </AuthGuard>
  );
}
