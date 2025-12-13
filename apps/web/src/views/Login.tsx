'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
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
import { useTheme } from "@/contexts/ThemeContext";

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

const inputPlaceholders = {
  email: "Seu endereço de email",
  passwordField: "Sua senha",
  username: "Nome de usuário",
  createPasswordField: "Crie sua senha",
  confirmPasswordField: "Confirme sua senha"
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
    <div className="space-y-2 w-full">
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="h-11 w-full rounded-[8px] bg-card pr-12 text-white placeholder:text-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed xl:h-10 2xl:h-10"
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
      <div className="space-y-2 w-full">
        <Input
          id="username"
          type="text"
          placeholder={placeholders.username}
          value={username}
          onChange={onUsernameChange}
          disabled={disabled}
          className="h-11 rounded-[8px] bg-card text-white placeholder:text-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed xl:h-10 2xl:h-10"
        />
      </div>
      <div className="space-y-2 w-full">
        <Input
          id="sign-up-email"
          type="email"
          inputMode="email"
          placeholder={placeholders.email}
          value={email}
          onChange={onEmailChange}
          disabled={disabled}
          className="h-11 rounded-[8px] bg-card text-white placeholder:text-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed xl:h-10 2xl:h-10"
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
      <div className="flex items-center gap-3">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={value => onAcceptTerms(Boolean(value))}
          disabled={disabled}
          className="mt-1 border-white/40"
        />
        <label
          htmlFor="terms"
          className="text-xs sm:text-sm xl:text-[11px] 2xl:text-sm text-white/70 leading-relaxed"
        >
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
      <div className="space-y-2 w-full">
        <Input
          id="email"
          type="email"
          inputMode="email"
          placeholder={placeholders.email}
          value={email}
          onChange={onEmailChange}
          disabled={disabled}
          className="h-11 rounded-[8px] bg-card text-foreground placeholder:text-foreground/40 disabled:opacity-50 disabled:cursor-not-allowed xl:h-10 2xl:h-10"
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
      <SelectTrigger
        className="flex w-full min-h-[72px] items-center justify-between rounded-[8px] bg-card px-4 py-4 text-left font-sora text-base font-semibold text-foreground/70 disabled:opacity-50 disabled:cursor-not-allowed xl:min-h-[70px] xl:py-3 2xl:min-h-[70px] 2xl:py-3"
      >
        <div className="flex flex-col gap-[1px] text-left">
          <SelectValue placeholder="Escolha uma opção" />
          <span className="font-sora text-foreground/30 text-sm xl:text-[11px] 2xl:text-xs">{selectedAccess.description}</span>
        </div>
      </SelectTrigger>
      <SelectContent
        className="flex w-full min-h-[64px] items-center justify-between rounded-[8px] bg-card text-left font-sora text-base font-semibold text-foreground/70 shadow-none sm:text-lg xl:min-h-[62px] xl:text-base xl:px-0 2xl:min-h-[62px]"
      >
        {accessOptions.map(option => (
          <SelectItem
            key={option.value}
            className="flex min-h-[64px] w-full items-center justify-between rounded-[8px] bg-card px-5 py-3 text-left font-sora text-base font-semibold text-foreground/70 transition hover:bg-foreground/5 data-[state=checked]:bg-foreground/10 sm:px-6 sm:py-4 sm:text-lg xl:min-h-[60px] xl:px-4 xl:py-2.5 xl:text-sm 2xl:min-h-[60px] 2xl:px-4 2xl:py-2.5"
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
    <div className="flex w-full max-w-[340px] gap-2 rounded-[8px] bg-card px-4 py-3 xl:py-2 2xl:py-2">
      {authTabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 rounded-[7px] px-3 py-2 font-sora text-sm transition-all sm:text-base xl:py-1.5 2xl:py-1.5",
              isActive ? "bg-foreground/10 text-foreground " : "bg-transparent text-foreground hover:text-primary"
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
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLightTheme = mounted && theme === "light";
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      if (isSignUp) {
        const created = await signUp({
          username: signUpUsername,
          email: signUpEmail,
          password: signUpPassword,
          termsAccepted: true,
          accessType: accessType as "purchases" | "products",
        });

        if (!created) {
          return;
        }

        setSuccessMessage("Cadastro realizado com sucesso! Faça login para continuar.");
        setActiveTab("sign-in");
        setSignInEmail(signUpEmail);
        setSignInPassword("");
        setSignUpUsername("");
        setSignUpEmail("");
        setSignUpPassword("");
        setSignUpConfirmPassword("");
        setTermsAccepted(false);
      } else {
        const redirectTo = accessType === "products" ? "/produtos" : "/dashboard";
        await signIn(
          {
            email: signInEmail,
            password: signInPassword
          },
          { redirectTo }
        );
      }
    } catch {
      // Erro já está no context
    }
  };

  const displayError = localError || error;

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-white lg:h-screen lg:flex-row">
      <div className="relative h-full w-full overflow-hidden xl:max-h-[750px] 2xl:max-h-[940px]">
        <Image
          src="/images/wallpaper.svg"
          alt="Plano de fundo Zuptos"
          fill
          priority
          className="xl:object-contain 2xl:object-cover"
        />
      </div>

      <div className="relative mx-auto flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 py-8 xl:w-[420px] xl:max-w-[420px] 2xl:w-[520px] 2xl:max-w-[520px]">
        <div className="flex flex-col items-center gap-4">
          <Image
            src={isLightTheme ? "/images/expandedDark.svg" : "/images/expanded.svg"}
            alt="Zuptos"
            width={150}
            height={48}
            className={cn("self-center w-auto", isLightTheme ? "h-12" : "h-12")}
            priority
          />
        </div>
        <AuthTabsSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="self-center text-center">
          <h1 className="text-foreground xl:text-base 2xl:text-[20px]">
            {isSignUp ? "Crie sua conta" : "Acesse a sua conta"}
          </h1>
        </div>
        {!isSignUp && (
          <div className="w-full max-w-[520px] sm:max-w-[560px] md:max-w-[600px] lg:max-w-[480px] xl:max-w-[320px] 2xl:max-w-[340px]">
            <AccessSelector value={accessType} onChange={setAccessType} disabled={isLoading} />
          </div>
        )}

        {displayError && (
          <div className="flex w-full max-w-[520px] sm:max-w-[560px] md:max-w-[600px] lg:max-w-[480px] xl:max-w-[320px] 2xl:max-w-[340px] items-center gap-3 rounded-[8px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 xl:py-2 xl:px-3 2xl:py-2 2xl:px-3">
            <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
            <p className="text-sm text-rose-200">{displayError}</p>
          </div>
        )}
        {successMessage && (
          <div className="flex w-full max-w-[520px] sm:max-w-[560px] md:max-w-[600px] lg:max-w-[480px] xl:max-w-[320px] 2xl:max-w-[340px] items-center gap-3 rounded-[8px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 xl:py-2 xl:px-3 2xl:py-2 2xl:px-3">
            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-100">{successMessage}</p>
          </div>
        )}

        <form
          className="flex w-full max-w-[520px] sm:max-w-[560px] md:max-w-[600px] lg:max-w-[480px] xl:max-w-[320px] 2xl:max-w-[340px] flex-col gap-4 rounded-[8px] bg-card px-5 py-6 shadow-2xl shadow-black/40 xl:gap-3 xl:px-4 xl:py-4 2xl:gap-3 2xl:px-4 2xl:py-4"
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
          className="mt-2 h-11 rounded-[8px] bg-primary hover:bg-primary/90 disabled:opacity-50 2xl:max-w-[340px] disabled:cursor-not-allowed text-base font-semibold transition xl:h-10 2xl:h-10"
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
              className="self-center text-sm font-semibold text-foreground transition hover:text-primary"
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
