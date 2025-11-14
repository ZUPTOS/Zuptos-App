'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    value: "producer",
    label: "Sou produtor(a)",
    description: "Gerencie seus produtos, vendas e comissões"
  },
  {
    value: "affiliate",
    label: "Sou afiliado(a)",
    description: "Acompanhe os produtos que está divulgando"
  }
];

export default function LoginView() {
  const [activeTab, setActiveTab] = useState(authTabs[0].id);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [accessType, setAccessType] = useState(accessOptions[0].value);

  const selectedAccess =
    accessOptions.find(option => option.value === accessType) ?? accessOptions[0];
  const activeTabConfig =
    authTabs.find(option => option.id === activeTab) ?? authTabs[0];

  return (
    <div className="relative flex flex-col  text-white lg:flex-row">
      <div className="relative min-h-screen flex-1 overflow-hidden lg:flex">
        <div className="flex items-center justify-center ">
        <Image
          src="/images/wallpaper.jpg"
          alt="Plano de fundo Zuptos"
          width={1920}
          height={1080}
          priority
          className="object-cover h-[1080px] w-[1920px]"
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
        <div className="flex w-full gap-2 rounded-[8px] bg-card px-[23px] py-[15px]">
          {authTabs.map(tab => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 rounded-[7px] px-4 py-2 text-base font-sora transition-all",
                  isActive
                    ? "bg-foreground/10 text-foreground "
                    : "bg-transparent text-foreground hover:text-white"
                )}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="self-center">
          <h1 className="text-[23px] font-semibold text-white">Acesse a sua conta</h1>
        </div>
        <div className="rounded-[8px] w-[405px] border bg-card p-5">
          <Select value={accessType} onValueChange={setAccessType}>
            <SelectTrigger className="h-14 w-full rounded-[8px] text-left text-base font-semibold text-white">
              <SelectValue placeholder="Escolha uma opção" />
            </SelectTrigger>
            <SelectContent className="text-white">
              {accessOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-2 text-xs text-white/70">{selectedAccess.description}</p>
        </div>

        <form
          className="flex flex-col w-[405px] rounded-[8px] gap-5 bg-card px-[16px] py-[32px]"
          onSubmit={event => event.preventDefault()}
        >
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              inputMode="email"
              placeholder="Seu endereço de email"
              className="h-12 w-[373px] rounded-[8px]  bg-card text-white placeholder:text-card"
            />
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="password"
                type={passwordVisible ? "text" : "password"}
                placeholder="Sua senha"
                className="h-12 w-[373px] rounded-[8px] bg-card pr-12 text-white placeholder:text-card"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(prev => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-white/60 transition hover:text-white"
                aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
              >
                {passwordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <Button
            asChild
            className="mt-2 h-12 rounded-[8px] bg-primary text-base font-semibold "
          >
            <Link href={activeTabConfig.ctaHref}>{activeTabConfig.ctaLabel}</Link>
          </Button>
          <Link
            href="#"
            className="self-center text-sm font-semibold text-white/70 transition hover:text-white"
          >
            Recuperar senha
          </Link>
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
