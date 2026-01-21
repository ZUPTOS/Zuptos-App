import type { FormEvent } from "react";
import ForgotPasswordForm from "../ForgotPasswordForm/ForgotPasswordForm";
import styles from "./ForgotPasswordModal.module.css";

type ForgotPasswordModalProps = {
  email: string;
  isSubmitting?: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function ForgotPasswordModal({
  email,
  isSubmitting = false,
  onEmailChange,
  onSubmit,
  onClose,
}: ForgotPasswordModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalBox}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <ForgotPasswordForm
          email={email}
          isSubmitting={isSubmitting}
          onEmailChange={onEmailChange}
          onSubmit={onSubmit}
          onBack={onClose}
        />
      </div>
    </div>
  );
}
