'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import {
  ArrowLeftRight,
  FileText,
  LayoutDashboard,
  Landmark,
  Package as PackageIcon,
  Settings,
  Users,
  UserCog,
  Wallet
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface NavItem {
  id: string;
  label: string;
  iconSrc?: string;
  IconComponent?: ComponentType<{ className?: string }>;
  href: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const initialPinned = (() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("sidebarPinned") === "true";
    } catch {
      return false;
    }
  })();
  const [isPinned, setIsPinned] = useState(initialPinned);
  const [isExpanded, setIsExpanded] = useState(initialPinned);
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const handleLogoClick = () => {
    setIsExpanded(true);
    setIsPinned(true);
  };

  const handleCloseSidebar = () => {
    setIsPinned(false);
    setIsExpanded(false);
  };

  const getIconStyle = (isActive: boolean) => {
    if (isActive) {
      return {
        filter:
          "brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(2474%) hue-rotate(263deg) brightness(94%) contrast(94%)",
      };
    }
    return isLightMode
      ? { filter: "brightness(1) invert(1)" }
      : { filter: "brightness(1) invert(0)" };
  };

  const defaultNavItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      iconSrc: "/images/ICON-1.svg",
      href: "/dashboard",
    },
    {
      id: "vendas",
      label: "Vendas",
      iconSrc: "/images/ICON-2.svg",
      href: "/vendas",
    },
    {
      id: "produtos",
      label: "Produtos",
      iconSrc: "/images/ICON-3.svg",
      href: "/produtos",
    },
    {
      id: "financas",
      label: "Finanças",
      iconSrc: "/images/ICON-4.svg",
      href: "/financas",
    },
    {
      id: "integracoes",
      label: "Integrações",
      iconSrc: "/images/ICON-5.svg",
      href: "/integracoes",
    },
    {
      id: "indique",
      label: "Indique",
      iconSrc: "/images/ICON-6.svg",
      href: "/indique",
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      id: "admin-dashboard",
      label: "Dashboard",
      href: "/admin/dashboard",
      IconComponent: LayoutDashboard
    },
    {
      id: "admin-financas",
      label: "Financeiro",
      href: "/admin/financas",
      IconComponent: Landmark
    },
    {
      id: "admin-transacoes",
      label: "Transações",
      href: "/admin/transacoes",
      IconComponent: ArrowLeftRight
    },
    {
      id: "admin-saques",
      label: "Saques",
      href: "/admin/saques",
      IconComponent: Wallet
    },
    {
      id: "admin-usuarios",
      label: "Usuários",
      href: "/admin/usuarios",
      IconComponent: Users
    },
    {
      id: "admin-documentos",
      label: "Documentos",
      href: "/admin/documentos",
      IconComponent: FileText
    },
    {
      id: "admin-produtos",
      label: "Produtos",
      href: "/admin/produtos",
      IconComponent: PackageIcon
    },
    {
      id: "admin-colaboradores",
      label: "Colaboradores",
      href: "/admin/colaboradores",
      IconComponent: UserCog
    },
    {
      id: "admin-configuracoes",
      label: "Configurações",
      href: "/admin/configuracoes",
      IconComponent: Settings
    }
  ];

  const isAdminRoute = pathname?.startsWith("/admin");
  const navItems = isAdminRoute ? adminNavItems : defaultNavItems;

  useEffect(() => {
    try {
      localStorage.setItem("sidebarPinned", isPinned ? "true" : "false");
    } catch {
      // ignore
    }
  }, [isPinned]);

  const isVisible = isExpanded || isPinned;

  useEffect(() => {
    if (isPinned) {
      setIsExpanded(true);
    }
  }, [isPinned]);

  useEffect(() => {
    const currentWidth = isVisible ? "var(--sidebar-expanded)" : "var(--sidebar-collapsed)";
    document.documentElement.style.setProperty("--sidebar-current-width", currentWidth);
    return () => {
      document.documentElement.style.removeProperty("--sidebar-current-width");
    };
  }, [isVisible]);

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen bg-background text-sidebar-foreground border-r border-sidebar-border backdrop-blur-[6px] transition-[width] duration-300 xl:max-w-[220px] 2xl:max-w-[240px]"
      style={{
        width: isVisible ? "var(--sidebar-expanded)" : "var(--sidebar-collapsed)"
      }}
    >
      {/* Logo Section */}
      <div
        className={`relative flex items-center justify-center ${isExpanded ? "px-6" : ""} p-3 xl:p-3 2xl:p-3 cursor-pointer`}
        onClick={handleLogoClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleLogoClick();
          }
        }}
      >
        {isExpanded ? (
          <Image
            src="/images/expanded.svg"
            alt="Zuptos logo"
            width={180}
            height={56}
            priority
            className="h-14 w-auto"
          />
        ) : (
          <Image
            src="/images/logoSide.svg"
            alt="Zuptos icon"
            width={32}
            height={32}
            priority
            className="h-9 w-auto"
          />
        )}
        {isVisible && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-transparent p-2 transition hover:text-primary"
            onClick={(event) => {
              event.stopPropagation();
              handleCloseSidebar();
            }}
            title="Fechar barra lateral"
            aria-label="Fechar barra lateral"
          >
            <Image src="/images/sidebutton.svg" alt="Fechar sidebar" width={24} height={24} />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2 p-4 xl:px-2 xl:py-2 2xl:p-3">
        {navItems.map((item) => {
          const Icon = item.IconComponent;
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
                className={`group relative flex w-full items-center gap-3 rounded-[7px] border border-card py-3 hover:bg-sidebar-hover transition-all duration-300 xl:py-2 2xl:py-2 ${
                  isActive ? "text-foreground" : ""
                } ${isVisible ? "px-4 xl:px-3" : "justify-center px-4 xl:px-3"}`}
              title={item.label}
            >
              {isActive && (
                <span className="absolute -left-2 h-10 w-[3px] bg-primary" />
              )}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] xl:h-6 xl:w-6 2xl:h-7 2xl:w-7">
                {item.iconSrc ? (
                  <Image
                    src={item.iconSrc}
                    alt={`${item.label} icon`}
                    width={28}
                    height={28}
                    className={`h-7 w-7 object-contain ${
                      isActive ? "text-primary" : ""
                    }`}
                    style={getIconStyle(isActive)}
                    priority={item.id === "dashboard"}
                  />
                ) : Icon ? (
                  <Icon
                    className={`h-5 w-5 xl:h-3.5 xl:w-3.5 2xl:h-4 2xl:w-4 ${
                      isActive ? "text-[#5823b2]" : "text-muted-foreground"
                    }`}
                  />
                ) : null}
              </span>
              {isVisible && (
                <span
                  className={`text-sm xl:text-xs 2xl:text-sm font-semibold tracking-tight transition-colors duration-200 ${
                    isActive
                      ? "text-primary"
                      : "text-foreground group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
