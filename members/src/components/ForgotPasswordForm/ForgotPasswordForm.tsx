import type { FormEvent } from "react";
import styles from "./ForgotPasswordForm.module.css";

type ForgotPasswordFormProps = {
  email: string;
  isSubmitting?: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
};

export default function ForgotPasswordForm({
  email,
  isSubmitting = false,
  onEmailChange,
  onSubmit,
  onBack,
}: ForgotPasswordFormProps) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.heading}>
        <h2 className={styles.title}>Esqueceu sua senha?</h2>
        <p className={styles.description}>
          Preencha abaixo seu endereco de e-mail para receber as instrucoes
          necessarias e criar uma nova senha.
        </p>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.srOnly} htmlFor="recovery-email">
          E-mail
        </label>
        <input
          className={styles.input}
          id="recovery-email"
          name="email"
          type="email"
          placeholder="Seu endereco de e-mail"
          autoComplete="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
        />
      </div>

      <button
        className={styles.primaryButton}
        type="submit"
        disabled={isSubmitting}
      >
        Recuperar minha senha
      </button>

      <button
        className={styles.secondaryLink}
        type="button"
        onClick={onBack}
      >
        Fazer login
      </button>
    </form>
  );
}
