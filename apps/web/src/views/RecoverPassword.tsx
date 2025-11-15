'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FooterGlow from "@/views/components/FooterGlow";

export default function RecoverPasswordView() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) {
      router.push("/email-enviado");
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
          className="mt-12 flex w-full max-w-[727px] h-[418px] flex-col items-center gap-6 rounded-[4px] bg-[#0E0E0E]/90 px-10 py-12 text-center shadow-[0px_20px_80px_rgba(0,0,0,0.45)]"
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
            className="h-12 w-full px-[18px] align-middle py-[28px] rounded-[8px] bg-[#131313] text-[19px] font-sora text-white placeholder:text-white/30"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
          />

          <div className="flex items-center justify-center flex-col gap-4">
            <Button
              type="submit"
              className="h-12 w-[556px] rounded-[8px] bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] text-[22px] font-sora font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              Enviar e-mail
            </Button>
            <Link
              href="/"
              className="w-[556px] text-[19px] font-sora font-semibold text-white/60 transition hover:text-white"
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
