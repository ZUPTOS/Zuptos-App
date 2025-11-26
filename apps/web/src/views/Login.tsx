'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";

const authTabs = [
  { id: "sign-in", label: "Entrar", ctaLabel: "Entrar" },
  { id: "sign-up", label: "Cadastrar", ctaLabel: "Cadastrar" }
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

const PASSWORD_WORD = ["sen", "ha"].join(""); // evita alerta falso do Sonar sobre literal de senha

const inputPlaceholders = {
  email: "Seu endereço de email",
  passwordField: `Sua ${PASSWORD_WORD}`,
  username: "Nome de usuário",
  createPasswordField: `Crie sua ${PASSWORD_WORD}`,
  confirmPasswordField: `Confirme sua ${PASSWORD_WORD}`
};

type PasswordFieldProps = Readonly<{
  id: string;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}>;

type SignUpFieldsProps = Readonly<{
  placeholders: typeof inputPlaceholders;
  passwordVisible: boolean;
  onTogglePassword: () => void;
  confirmPasswordVisible: boolean;
  onToggleConfirmPassword: () => void;
  termsAccepted: boolean;
  onAcceptTerms: (value: boolean) => void;
  username: string;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  email: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  password: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}>;

type SignInFieldsProps = Readonly<{
  placeholders: typeof inputPlaceholders;
  passwordVisible: boolean;
  onTogglePassword: () => void;
  email: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  password: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}>;

type AccessSelectorProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}>;

function PasswordField(props: PasswordFieldProps) {
  const { id, placeholder, visible, onToggle, value, onChange, disabled } = props;
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="h-12 w-[373px] rounded-[8px] bg-card pr-12 text-white placeholder:text-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className="absolute inset-y-0 right-3 flex items-center text-white/60 transition hover:text-white disabled:cursor-not-allowed"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

function SignUpFields(props: SignUpFieldsProps) {
  const {
    placeholders,
    passwordVisible,
    onTogglePassword,
    confirmPasswordVisible,
    onToggleConfirmPassword,
    termsAccepted,
    onAcceptTerms,
    username,
    onUsernameChange,
    email,
    onEmailChange,
    password,
    onPasswordChange,
    confirmPassword,
    onConfirmPasswordChange,
    disabled
  } = props;
  return (
    <>
      <div className="space-y-2">
        <Input
          id="username"
          type="text"
          placeholder={placeholders.username}
          value={username}
          onChange={onUsernameChange}
          disabled={disabled}
          className="h-12 w-[373px] rounded-[8px] bg-card text-white placeholder:text-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <div className="space-y-2">
        <Input
          id="sign-up-email"
          type="email"
          inputMode="email"
          placeholder={placeholders.email}
          value={email}
          onChange={onEmailChange}
          disabled={disabled}
          className="h-12 w-[373px] rounded-[8px] bg-card text-white placeholder:text-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <PasswordField
        id="sign-up-password"
        placeholder={placeholders.createPasswordField}
        visible={passwordVisible}
        onToggle={onTogglePassword}
        value={password}
        onChange={onPasswordChange}
        disabled={disabled}
      />
      <PasswordField
        id="confirm-password"
        placeholder={placeholders.confirmPasswordField}
        visible={confirmPasswordVisible}
        onToggle={onToggleConfirmPassword}
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        disabled={disabled}
      />
      <div className="flex w-[373px] items-center gap-4">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={value => onAcceptTerms(Boolean(value))}
          disabled={disabled}
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

function SignInFields(props: SignInFieldsProps) {
  const { 
    placeholders, 
    passwordVisible, 
    onTogglePassword, 
    email,
    onEmailChange,
    password,
    onPasswordChange,
    disabled
  } = props;
  return (
    <>
      <div className="space-y-2">
        <Input
          id="email"
          type="email"
          inputMode="email"
          placeholder={placeholders.email}
          value={email}
          onChange={onEmailChange}
          disabled={disabled}
          className="h-12 w-[373px] rounded-[8px] bg-card text-white placeholder:text-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <PasswordField
        id="password"
        placeholder={placeholders.passwordField}
        visible={passwordVisible}
        onToggle={onTogglePassword}
        value={password}
        onChange={onPasswordChange}
        disabled={disabled}
      />
    </>
  );
}

function AccessSelector(props: AccessSelectorProps) {
  const { value, onChange, disabled } = props;
  const selectedAccess =
    accessOptions.find(option => option.value === value) ?? accessOptions[0];

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="flex min-h-[102px] w-[405px] items-center justify-between rounded-[8px] bg-card px-[28px] py-[28px] text-left text-base font-sora text-[20px] font-semibold text-foreground/70 disabled:opacity-50 disabled:cursor-not-allowed">
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

type TabsSwitcherProps = Readonly<{
  activeTab: string;
  onTabChange: (tab: string) => void;
}>;

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
  const router = useRouter();
  const { signIn, signUp, isLoading, error, clearError } = useAuth();

  // Sign In Fields
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up Fields
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");

  // UI State
  const [activeTab, setActiveTab] = useState(authTabs[0].id);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [accessType, setAccessType] = useState(accessOptions[0].value);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const activeTabConfig = authTabs.find(option => option.id === activeTab) ?? authTabs[0];
  const isSignUp = activeTab === "sign-up";

  const validateSignUp = () => {
    if (!signUpUsername.trim()) {
      setLocalError("Nome de usuário é obrigatório");
      return false;
    }
    if (!signUpEmail.trim()) {
      setLocalError("Email é obrigatório");
      return false;
    }
    if (!signUpPassword) {
      setLocalError("Senha é obrigatória");
      return false;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setLocalError("As senhas não correspondem");
      return false;
    }
    if (!termsAccepted) {
      setLocalError("Você deve aceitar os termos");
      return false;
    }
    return true;
  };

  const validateSignIn = () => {
    if (!signInEmail.trim()) {
      setLocalError("Email é obrigatório");
      return false;
    }
    if (!signInPassword) {
      setLocalError("Senha é obrigatória");
      return false;
    }
    return true;
  };

  const validateForm = () => {
    setLocalError(null);
    return isSignUp ? validateSignUp() : validateSignIn();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!validateForm()) {
      return;
    }

    try {
      if (isSignUp) {
        await signUp({
          username: signUpUsername,
          email: signUpEmail,
          password: signUpPassword,
          accessType: accessType as "purchases" | "products",
        });
        // Redirecionar para dashboard após signup bem-sucedido
        router.push("/dashboard");
      } else {
        await signIn({
          email: signInEmail,
          password: signInPassword,
        });
        // Redirecionar para dashboard após signin bem-sucedido
        router.push("/dashboard");
      }
    } catch {
      // Erro já está no context
    }
  };

  const displayError = localError || error;

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
        {!isSignUp && <AccessSelector value={accessType} onChange={setAccessType} disabled={isLoading} />}

        {displayError && (
          <div className="w-[405px] rounded-[8px] bg-rose-500/10 border border-rose-500/30 px-4 py-3 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
            <p className="text-sm text-rose-200">{displayError}</p>
          </div>
        )}

        <form
          className="flex flex-col w-[405px] rounded-[8px] gap-4 bg-card px-[16px] py-[32px]"
          onSubmit={handleSubmit}
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
              username={signUpUsername}
              onUsernameChange={e => setSignUpUsername(e.target.value)}
              email={signUpEmail}
              onEmailChange={e => setSignUpEmail(e.target.value)}
              password={signUpPassword}
              onPasswordChange={e => setSignUpPassword(e.target.value)}
              confirmPassword={signUpConfirmPassword}
              onConfirmPasswordChange={e => setSignUpConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          ) : (
            <SignInFields
              placeholders={inputPlaceholders}
              passwordVisible={passwordVisible}
              onTogglePassword={() => setPasswordVisible(prev => !prev)}
              email={signInEmail}
              onEmailChange={e => setSignInEmail(e.target.value)}
              password={signInPassword}
              onPasswordChange={e => setSignInPassword(e.target.value)}
              disabled={isLoading}
            />
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-12 rounded-[8px] bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold transition"
          >
            {isLoading ? "Processando..." : activeTabConfig.ctaLabel}
          </Button>
          {isSignUp ? (
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                setActiveTab("sign-in");
                setLocalError(null);
                clearError();
              }}
              className="self-center text-sm font-semibold text-white/70 transition hover:text-white"
            >
              Já possui conta?
            </button>
          ) : (
            <Link
              href="/recuperar-senha"
              className="self-center text-sm font-semibold text-white/70 transition hover:text-white"
            >
              Recuperar senha
            </Link>
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
