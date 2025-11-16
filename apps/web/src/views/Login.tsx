'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, type Dispatch, type SetStateAction } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const authTabs = [
  { id: "sign-in", label: "Entrar", ctaHref: "/dashboard", ctaLabel: "Entrar" },
  { id: "sign-up", label: "Cadastrar", ctaHref: "/cadastro", ctaLabel: "Cadastrar" }
];

const accessOptions = [
  {
    value: "purchases",
    label: "Acessar minhas compras",
    description: "Para acessar os produtos que você comprou"
  },
  {
    value: "products",
    label: "Gerenciar meus produtos",
    description: "Para produtores e co-produtores"
  }
];

const inputPlaceholders = {
  email: "Seu endereço de email",
  passwordField: "Sua senha",
  fullName: "Nome completo",
  createPasswordField: "Crie sua senha",
  confirmPasswordField: "Confirme sua senha"
};

type PasswordFieldProps = {
  id: string;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
};

type SignUpFieldsProps = {
  placeholders: typeof inputPlaceholders;
  passwordVisible: boolean;
  onTogglePassword: () => void;
  confirmPasswordVisible: boolean;
  onToggleConfirmPassword: () => void;
  termsAccepted: boolean;
  onAcceptTerms: (value: boolean) => void;
};

type SignInFieldsProps = {
  placeholders: typeof inputPlaceholders;
  passwordVisible: boolean;
  onTogglePassword: () => void;
};

type AccessSelectorProps = {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
};

function PasswordField({ id, placeholder, visible, onToggle }: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          className="h-12 w-[373px] rounded-[8px] bg-card pr-12 text-white placeholder:text-foreground/10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-3 flex items-center text-white/60 transition hover:text-white"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

function SignUpFields({
  placeholders,
  passwordVisible,
  onTogglePassword,
  confirmPasswordVisible,
  onToggleConfirmPassword,
  termsAccepted,
  onAcceptTerms
}: SignUpFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Input
          id="full-name"
          type="text"
          placeholder={placeholders.fullName}
          className="h-12 w-[373px] rounded-[8px] bg-card text-white placeholder:text-foreground/10"
        />
      </div>
      <div className="space-y-2">
        <Input
          id="sign-up-email"
          type="email"
          inputMode="email"
          placeholder={placeholders.email}
          className="h-12 w-[373px] rounded-[8px] bg-card text-white placeholder:text-foreground/10"
        />
      </div>
      <PasswordField
        id="sign-up-password"
        placeholder={placeholders.createPasswordField}
        visible={passwordVisible}
        onToggle={onTogglePassword}
      />
      <PasswordField
        id="confirm-password"
        placeholder={placeholders.confirmPasswordField}
        visible={confirmPasswordVisible}
        onToggle={onToggleConfirmPassword}
      />
      <div className="flex w-[373px] items-center gap-4">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={value => onAcceptTerms(Boolean(value))}
          className="mt-1 border-white/40"
        />
        <label htmlFor="terms" className="text-sm text-white/70 leading-relaxed">
          Li e aceito os{" "}
          <Link href="#" className="text-primary underline-offset-2 hover:underline">
            Termos de uso
          </Link>
          ,{" "}
          <Link href="#" className="text-primary underline-offset-2 hover:underline">
            Políticas de privacidade
          </Link>{" "}
          e os{" "}
          <Link href="#" className="text-primary underline-offset-2 hover:underline">
            termos de programa de afiliado
          </Link>
        </label>
      </div>
    </>
  );
}

function SignInFields({ placeholders, passwordVisible, onTogglePassword }: SignInFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Input
          id="email"
          type="email"
          inputMode="email"
          placeholder={placeholders.email}
          className="h-12 w-[373px] rounded-[8px]  bg-card text-white placeholder:text-foreground/10"
        />
      </div>
      <PasswordField
        id="password"
        placeholder={placeholders.passwordField}
        visible={passwordVisible}
        onToggle={onTogglePassword}
      />
    </>
  );
}

function AccessSelector({ value, onChange }: AccessSelectorProps) {
  const selectedAccess =
    accessOptions.find(option => option.value === value) ?? accessOptions[0];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="flex min-h-[102px] w-[405px] items-center justify-between rounded-[8px] bg-card px-[28px] py-[28px] text-left text-base font-sora text-[20px] font-semibold text-foreground/70">
        <div className="flex flex-col gap-[1px] text-left">
          <SelectValue placeholder="Escolha uma opção" />
          <span className="text-[14px] font-sora text-foreground/30">{selectedAccess.description}</span>
        </div>
      </SelectTrigger>
      <SelectContent className="flex min-h-[70px] w-[405px] items-center justify-between rounded-[8px] bg-card text-left text-base font-sora text-[20px] font-semibold text-foreground/70 shadow-none">
        {accessOptions.map(option => (
          <SelectItem
            key={option.value}
            className="flex min-h-[70px] w-[405px] items-center justify-between rounded-[8px] bg-card px-[28px] py-[18px] text-left text-base font-sora text-[20px] font-semibold text-foreground/70"
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type TabsSwitcherProps = {
  activeTab: string;
  onTabChange: Dispatch<SetStateAction<string>>;
};

function AuthTabsSwitcher({ activeTab, onTabChange }: TabsSwitcherProps) {
  return (
    <div className="flex w-full gap-2 rounded-[8px] bg-card px-[23px] py-[15px]">
      {authTabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 rounded-[7px] px-4 py-2 text-base font-sora transition-all",
              isActive ? "bg-foreground/10 text-foreground " : "bg-transparent text-foreground hover:text-white"
            )}
            aria-pressed={isActive}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default function LoginView() {
  const [activeTab, setActiveTab] = useState(authTabs[0].id);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [accessType, setAccessType] = useState(accessOptions[0].value);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const activeTabConfig =
    authTabs.find(option => option.id === activeTab) ?? authTabs[0];
  const isSignUp = activeTab === "sign-up";

  return (
    <div className="relative flex flex-col  text-white lg:flex-row">
      <div className="relative min-h-screen flex-1 overflow-hidden lg:flex">
        <div className="flex items-center h-[945px] justify-center ">
        <Image
          src="/images/wallpaper.svg"
          alt="Plano de fundo Zuptos"
          width={1620}
          height={945}
          priority
          className="object-cover h-[945px] w-[1620px]"
        />
 
        </div>
     </div>

      <div className="relative flex items-center justify-center w-full flex-col gap-8 bg-background px-8 py-12 sm:px-12 lg:max-w-[496px]">
        <div className="flex flex-col gap-6 items-center">
          <Image
            src="/images/expanded.svg"
            alt="Zuptos"
            width={150}
            height={48}
            className="self-center"
            priority
          />
          
        </div>
        <AuthTabsSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="self-center">
          <h1 className="text-[23px] font-semibold text-white">
            {isSignUp ? "Crie sua conta" : "Acesse a sua conta"}
          </h1>
        </div>
        {!isSignUp && <AccessSelector value={accessType} onChange={setAccessType} />}

        <form
          className="flex flex-col w-[405px] rounded-[8px] gap-4 bg-card px-[16px] py-[32px]"
          onSubmit={event => event.preventDefault()}
        >
          {isSignUp ? (
            <SignUpFields
              placeholders={inputPlaceholders}
              passwordVisible={passwordVisible}
              onTogglePassword={() => setPasswordVisible(prev => !prev)}
              confirmPasswordVisible={confirmPasswordVisible}
              onToggleConfirmPassword={() => setConfirmPasswordVisible(prev => !prev)}
              termsAccepted={termsAccepted}
              onAcceptTerms={value => setTermsAccepted(value)}
            />
          ) : (
            <SignInFields
              placeholders={inputPlaceholders}
              passwordVisible={passwordVisible}
              onTogglePassword={() => setPasswordVisible(prev => !prev)}
            />
          )}
          <Button
            asChild
            className="mt-2 h-12 rounded-[8px] bg-primary text-base font-semibold "
          >
            <Link href={activeTabConfig.ctaHref}>{activeTabConfig.ctaLabel}</Link>
          </Button>
          {isSignUp ? (
            <Link
              href="#"
              onClick={event => {
                event.preventDefault();
                setActiveTab("sign-in");
              }}
              className="self-center text-sm font-semibold text-white/70 transition hover:text-white"
            >
              Já possui conta?
            </Link>
          ) : (
            <Button
              variant="link"
              asChild
              className="self-center h-auto p-0 text-sm font-semibold text-white/70 transition hover:text-white"
            >
              <Link href="/recuperar-senha">Recuperar senha</Link>
            </Button>
          )}
        </form>

        <div className="mt-auto flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5">
            <Image src="/images/logoSide.svg" alt="Zuptos monograma" width={28} height={28} />
          </div>
        </div>
      </div>
    </div>
  );
}
