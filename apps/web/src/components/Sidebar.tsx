'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface NavItem {
  id: string;
  label: string;
  iconSrc: string;
  href: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const isLightMode = theme === "light";
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

  const navItems: NavItem[] = [
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

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-background text-sidebar-foreground border-r border-sidebar-border backdrop-blur-[6px] transition-all duration-300 z-40 ${
        isExpanded ? "w-64" : "w-[88px]"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Section */}
      <div
        className={`flex items-center ${
          isExpanded ? "justify-center px-6" : "justify-center"
        } p-4`}
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
            width={43}
            height={43}
            priority
            className="h-12 w-auto"
          />
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative flex w-full items-center gap-3 rounded-[7px] border border-card py-3 hover:bg-sidebar-hover transition-all duration-300 ${
                isActive ? "text-foreground" : ""
              } ${isExpanded ? "px-4" : "justify-center px-4"}`}
              title={item.label}
            >
              {isActive && (
                <span className="absolute -left-2 h-10 w-[3px] bg-primary" />
              )}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px]">
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
              </span>
              {isExpanded && (
                <span
                  className={`text-[1rem] font-semibold tracking-tight transition-colors duration-200 ${
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
