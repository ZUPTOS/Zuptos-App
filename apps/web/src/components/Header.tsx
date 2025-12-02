'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  HelpCircle,
  Moon,
  Sun,
  ChevronDown,
  User as UserIcon
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  userName: string;
  userLocation: string;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function Header({
  userName,
  userLocation,
  pageTitle = "Dashboard",
  pageSubtitle,
}: Readonly<HeaderProps>) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const isLightMode = theme === "light";
  const [mounted, setMounted] = useState(false);
  
  const handleLogout = async () => {
    try {
      await signOut();
      // signOut já redireciona para home
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Fazer logout local mesmo em caso de erro
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      router.push('/');
    }
  };
  
  const handleThemeToggle = () => {
    toggleTheme?.();
  };
  const profileButtonClasses = [
    "group flex min-w-[257px] h-[57px] items-center gap-4 rounded-[7px] border px-4 py-3 text-left bg-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
    isLightMode
      ? "bg-card hover:bg-muted"
      : "bg-[#050505] border-white/10 hover:bg-[#0d0d0d] shadow-[0_18px_45px_rgba(0,0,0,0.6)]"
  ].join(" ");
  const badgeClasses = [
    "inline-flex items-center rounded-[8px] px-2 py-0.5 text-[12px] font-sora ",
    isLightMode ? "bg-muted text-muted-foreground" : "border border-white/10 bg-white/5 text-foreground"
  ].join(" ");
  const dividerClasses = isLightMode
    ? "hidden sm:block h-10 w-px bg-border/80"
    : "hidden sm:block h-10 w-px bg-white/10";
  const chevronContainerClasses = [
    "inline-flex h-9 w-9 items-center justify-center border-[2px] rounded-[7px] p-1 transition-all duration-200",
    isLightMode
      ? "border-primary/20 bg-primary/10 text-primary/80 group-hover:bg-primary/20"
      : "border-primary/50 bg-transparent text-primary group-hover:bg-primary/10"
  ].join(" ");
  const avatarWrapperClasses = [
    "relative h-12 w-12 overflow-hidden transition-all duration-200 rounded-full",
    isLightMode ? "bg-muted" : "bg-[#050505] border border-white/10"
  ].join(" ");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-background sticky top-0 z-30 transition-colors border-b">
      <div className="flex items-center justify-between py-2" style={{ paddingInline: "var(--header-padding-x)" }}>
        <div className="flex flex-col gap-1">
          {pageSubtitle && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground/70">
              {pageSubtitle}
            </span>
          )}
          <h1 className="text-2xl font-semibold text-foreground">{pageTitle || ""}</h1>
        </div>
        <div className="flex items-center gap-4 ml-6">
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={profileButtonClasses}
            >
              <div className="flex flex-1 items-center gap-3">
                <div className={avatarWrapperClasses}>
                  {!isLightMode && (
                    <span className="pointer-events-none absolute inset-x-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#5823b2] via-[#8b5cf6] to-[#5823b2] opacity-80 blur-sm" />
                  )}
                  <div className="relative z-10 flex h-full w-full items-center justify-center">
                    <Image
                      src="/images/logoSide.svg"
                      alt={`${userName} avatar`}
                      width={28}
                      height={28}
                      className="h-7 w-7"
                    />
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{userName}</p>
                  <span className={badgeClasses}>{userLocation}</span>
                </div>
              </div>
              <div className={dividerClasses} aria-hidden="true" />
              <span className={chevronContainerClasses}>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-none dark:shadow-lg overflow-hidden transition-colors">
                <Link
                  href="/minha-conta"
                  className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-b border-border/60"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="text-sm">Meu perfil</span>
                </Link>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-b border-border/60">
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-sm">Central de ajuda</span>
                </button>
                <button
                  onClick={handleThemeToggle}
                  className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-b border-border/60"
                >
                  {isLightMode ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {isLightMode ? "Modo escuro" : "Modo claro"}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-muted transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">
                    Sair
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
