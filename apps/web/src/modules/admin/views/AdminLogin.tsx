'use client';

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLoginView() {
  const { theme } = useTheme();
  const isLightTheme = theme === "light";
  const { signIn, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "");
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    clearError();
    try {
      await signIn({ email, password }, { redirectTo: "/admin-dashboard" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível autenticar.";
      setLocalError(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-white">
      <div className="w-full max-w-[420px] rounded-[14px] border border-white/10 bg-card/80 px-6 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col items-center gap-3">
          <Image
            src={isLightTheme ? "/images/expandedDark.svg" : "/images/expanded.svg"}
            alt="Zuptos"
            width={150}
            height={48}
            className="h-12 w-auto"
            priority
          />
          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground">Acesso administrativo</h1>
            <p className="text-sm text-muted-foreground">Entre com as credenciais do admin.</p>
          </div>
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          {(localError || error) && (
            <div className="rounded-[8px] border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {localError ?? error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="admin-email" className="text-sm font-semibold text-foreground">
              Email
            </label>
            <Input
              id="admin-email"
              type="email"
              placeholder="Seu email de admin"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-11 rounded-[8px] bg-card text-white placeholder:text-foreground/30"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-password" className="text-sm font-semibold text-foreground">
              Senha
            </label>
            <Input
              id="admin-password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-11 rounded-[8px] bg-card text-white placeholder:text-foreground/30"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-11 rounded-[8px] bg-primary text-base font-semibold transition hover:bg-primary/90"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
