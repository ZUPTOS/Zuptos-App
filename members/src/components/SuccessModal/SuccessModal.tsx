import styles from "./SuccessModal.module.css";

type SuccessModalProps = {
  email: string;
  onClose: () => void;
};

export default function SuccessModal({ email, onClose }: SuccessModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalBox}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className={styles.title}>
          E-mail de recuperação de senha enviado!
        </h3>
        <p className={styles.subtitle}>
          Verifique sua caixa de entrada do email: {email}
        </p>
        <button className={styles.primaryButton} type="button" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
