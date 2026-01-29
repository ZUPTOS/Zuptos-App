import type { Dispatch, SetStateAction } from "react";
import { SectionCard } from "../shared";

type RequiredFieldToggle = {
  label: string;
  value: boolean;
  onChange: Dispatch<SetStateAction<boolean>>;
};

type RequiredFieldsSectionProps = {
  requiredAddress: boolean;
  setRequiredAddress: Dispatch<SetStateAction<boolean>>;
  requiredPhone: boolean;
  setRequiredPhone: Dispatch<SetStateAction<boolean>>;
  requiredBirthdate: boolean;
  setRequiredBirthdate: Dispatch<SetStateAction<boolean>>;
  requiredDocument: boolean;
  setRequiredDocument: Dispatch<SetStateAction<boolean>>;
  requiredEmailConfirmation: boolean;
  setRequiredEmailConfirmation: Dispatch<SetStateAction<boolean>>;
};

export const RequiredFieldsSection = ({
  requiredAddress,
  setRequiredAddress,
  requiredPhone,
  setRequiredPhone,
  requiredBirthdate,
  setRequiredBirthdate,
  requiredDocument,
  setRequiredDocument,
  requiredEmailConfirmation,
  setRequiredEmailConfirmation,
}: RequiredFieldsSectionProps) => {
  const fields: RequiredFieldToggle[] = [
    { label: "Endereço", value: requiredAddress, onChange: setRequiredAddress },
    { label: "Telefone", value: requiredPhone, onChange: setRequiredPhone },
    { label: "Data de nascimento", value: requiredBirthdate, onChange: setRequiredBirthdate },
    { label: "CPF", value: requiredDocument, onChange: setRequiredDocument },
  ];

  return (
    <SectionCard title="Campos obrigatórios no Checkout" iconSrc="/images/editar-produtos/warning.svg">
      <div className="space-y-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Itens Obrigatórios</p>
        <div className="flex flex-wrap gap-2">
          {fields.map(field => {
            const active = field.value;
            return (
              <button
                key={field.label}
                type="button"
                onClick={() => field.onChange(!active)}
                className={`rounded-[8px] px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? "bg-primary/80 text-primary-foreground shadow-[0_8px_20px_rgba(108,39,215,0.35)]"
                    : "border border-foreground/20 bg-card text-muted-foreground"
                }`}
              >
                {field.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
        <span>Confirmação de email</span>
        <button
          type="button"
          className={`relative inline-flex h-5 w-10 items-center rounded-full ${requiredEmailConfirmation ? "bg-primary/70" : "bg-muted"}`}
          onClick={() => setRequiredEmailConfirmation(prev => !prev)}
        >
          <span
            className={`absolute h-4 w-4 rounded-full bg-white transition ${
              requiredEmailConfirmation ? "left-[calc(100%-18px)]" : "left-[6px]"
            }`}
          />
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        O usuário será condicionado a reportar o email informado em um campo específico para sua confirmação.
      </p>
    </SectionCard>
  );
};
