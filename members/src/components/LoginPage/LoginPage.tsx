"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import ForgotPasswordForm from "../ForgotPasswordForm/ForgotPasswordForm";
import SuccessModal from "../SuccessModal/SuccessModal";
import styles from "./LoginPage.module.css";

type ViewMode = "login" | "forgot";

type LoginPageProps = {
  baseFontClassName?: string;
  displayFontClassName?: string;
};

export default function LoginPage({
  baseFontClassName,
  displayFontClassName,
}: LoginPageProps) {
  const [view, setView] = useState<ViewMode>("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const wrapperClassName = [styles.pageWrapper, baseFontClassName]
    .filter(Boolean)
    .join(" ");
  const displayClassName = displayFontClassName ?? "";

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleRecoverySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isRecovering) return;
    setIsRecovering(true);
    timeoutRef.current = window.setTimeout(() => {
      setShowSuccess(true);
      setIsRecovering(false);
    }, 650);
  };

  const handleCloseModal = () => {
    setShowSuccess(false);
    setView("login");
  };

  return (
    <div className={wrapperClassName}>
      <section className={styles.leftPanel} aria-hidden="true">
        <div className={[styles.topSeason, displayClassName].join(" ")}>
          <span className={styles.topSeasonLabel}>SEASON</span>
          <span className={styles.topSeasonNumber}>24</span>
        </div>
        <div className={styles.centerBlock}>
          <div className={[styles.seasonTitle, displayClassName].join(" ")}>
            <span>SEAS</span>
            <span className={styles.targetCircle} />
            <span>N</span>
            <span className={styles.seasonNumber}>24</span>
          </div>
          <div className={styles.banner}>LEGITXIT</div>
        </div>
        <p className={styles.bottomDescription}>
          Operacao preparada para a temporada mais intensa do ano. Acesse o
          painel e mantenha sua equipe alinhada com cada movimento.
        </p>
      </section>

      <section className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <div className={styles.logo} aria-hidden="true" />

          {view === "login" ? (
            <>
              <form className={styles.form} onSubmit={handleLoginSubmit}>
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="login-email">
                    E-mail
                  </label>
                  <input
                    className={styles.input}
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="Seu endereco de e-mail"
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="login-password">
                    Senha
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      className={[styles.input, styles.inputWithToggle].join(" ")}
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                    />
                    <button
                      className={styles.visibilityButton}
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      <span className={styles.visibilityIcon} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <button className={styles.primaryButton} type="submit">
                  Entrar
                </button>
              </form>

              <button
                className={styles.secondaryLink}
                type="button"
                onClick={() => setView("forgot")}
              >
                Recuperar senha
              </button>
            </>
          ) : (
            <ForgotPasswordForm
              email={recoveryEmail}
              isSubmitting={isRecovering}
              onEmailChange={setRecoveryEmail}
              onSubmit={handleRecoverySubmit}
              onBack={() => setView("login")}
            />
          )}
        </div>
      </section>

      {showSuccess ? (
        <SuccessModal
          email={recoveryEmail || "email@email.com"}
          onClose={handleCloseModal}
        />
      ) : null}
    </div>
  );
}
