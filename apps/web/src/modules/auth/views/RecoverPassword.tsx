'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import FooterGlow from "@/views/components/FooterGlow";
import { authApi } from "@/lib/api";
import { notify } from "@/shared/ui/notification-toast";

export default function RecoverPasswordView() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await authApi.recoverPassword(email.trim());
      notify.success("E-mail enviado", "Verifique sua caixa de entrada para redefinir a senha.");
      router.push("/email-enviado");
    } catch (error) {
      console.error("Erro ao enviar e-mail de recuperação:", error);
      notify.error("Não foi possível enviar", "Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
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
          className="mt-12 flex w-full max-w-[727px] h-[418px] flex-col items-center gap-6 rounded-[4px] bg-card px-10 py-12 text-center"
        >
          <div className="space-y-3">
            <h1 className="text-[32px] font-sora text-foreground/90 font-semibold">Nova senha</h1>
            <p className="text-sora text-[30px] text-foreground/90">
              Confirme o e-mail utilizado em sua compra para criar uma nova senha.
            </p>
          </div>

          <div className="w-[556px] flex items-center justify-center flex-col gap-8">
          <Input
            id="recovery-email"
            type="email"
            inputMode="email"
            placeholder="Seu endereço de e-mail"
            className="h-12 w-full px-[18px] align-middle py-[28px] rounded-[8px] bg-card text-[19px] font-sora text-foreground placeholder:text-foreground/40"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
          />

          <div className="flex items-center justify-center flex-col gap-4">
            <Button
              type="submit"
              className="h-12 w-[556px] rounded-[8px] bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] text-[22px] font-sora font-semibold text-white shadow-lg transition hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar e-mail"}
            </Button>
            <Link
              href="/"
              className="w-[556px] text-[19px] font-sora font-semibold text-foreground/40 transition hover:text-primary"
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
