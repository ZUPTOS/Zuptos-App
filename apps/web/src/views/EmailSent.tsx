'use client';

import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import FooterGlow from "@/views/components/FooterGlow";

export default function EmailSentView() {
  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background text-white">
      <div className="relative z-10 flex w-full flex-1 flex-col items-center px-4 pb-16 pt-12">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/expanded.svg" alt="Zuptos" width={150} height={48} priority />
        </Link>

        <div className="mt-12 flex w-full max-w-[727px] h-[418px] flex-col gap-6 rounded-[20px] bg-[#0E0E0E]/90 px-10 py-12 text-center shadow-[0px_20px_80px_rgba(0,0,0,0.45)]">
          <div className="mx-auto flex h-16 w-16 items-center">
          <Image src="/images/mail.svg" alt="Zuptos" width={65} height={65} priority />
          </div>
          <div className="space-y-3 w-[434px] self-center">
            <h1 className="text-[32px] text-foreground/90 font-semibold">Confira seu e-mail</h1>
            <p className="text-[22px] text-sora text-foreground/90">
              Confira sua caixa de entrada para criar uma nova senha.
            </p>
            <p className="text-[22px] text-sora text-foreground/90">
              Não esqueça de verificar a caixa de spam.
            </p>
          </div>
        </div>
      </div>

      <FooterGlow />
    </div>
  );
}
