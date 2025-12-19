'use client';

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FooterGlow from "@/views/components/FooterGlow";
import { notify } from "@/components/ui/notification-toast";
import { authApi } from "@/lib/api";

export default function NewPasswordView() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("[NovaSenha] Token recebido na URL:", token || "ausente");
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      notify.error("Link inválido", "Token ausente. Solicite um novo e-mail de recuperação.");
      return;
    }
    if (!password) {
      notify.warning("Senha obrigatória", "Digite a nova senha.");
      return;
    }
    setIsSubmitting(true);
    try {
      console.log("[NovaSenha] Payload enviado:", {
        token: token || "sem token",
        password,
      });
      const response = await authApi.resetPassword(token, password);
      console.log("[NovaSenha] Resposta do backend:", response);
      notify.success("Senha alterada com sucesso", "Volte para o início e faça login novamente.");
    } catch (error) {
      console.error("Erro ao definir nova senha:", error);
      notify.error("Não foi possível atualizar", "Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background text-white">
      <div className="relative z-10 flex w-full flex-1 flex-col items-center px-4 pb-16 pt-12">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/expanded.svg" alt="Zuptos" width={150} height={48} priority />
        </Link>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex w-full max-w-[540px] min-h-[360px] flex-col items-center gap-5 rounded-[6px] bg-card px-8 py-10 text-center"
        >
          <div className="space-y-3">
            <h1 className="text-[26px] font-sora text-foreground/90 font-semibold">Definir nova senha</h1>
            <p className="text-sora text-[18px] text-foreground/80">
              Crie uma senha forte para acessar sua conta com segurança.
            </p>
          </div>

          <div className="w-full flex flex-col items-center justify-center gap-5">
            <Input
              id="new-password"
              type="password"
              placeholder="Nova senha"
              className="h-11 w-full px-4 py-3 rounded-[8px] bg-card text-[16px] font-sora text-foreground placeholder:text-foreground/40"
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
              minLength={6}
            />

            <div className="flex w-full flex-col items-center gap-4">
              <Button
                type="submit"
                className="h-11 w-full rounded-[8px] bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] text-[18px] font-sora font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Salvar nova senha"}
              </Button>
              <Link
                href="/"
                className="w-full text-[16px] font-sora font-semibold text-foreground/40 transition hover:text-primary text-center"
              >
                Cancelar
              </Link>
            </div>
          </div>
        </form>
      </div>

      <FooterGlow />
    </div>
  );
}
