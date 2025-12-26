'use client';

import Sidebar from "./Sidebar";
import Header from "./Header";
import KycReminder from "./KycReminder";
import { useLoadingOverlay } from "@/contexts/LoadingOverlayContext";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  userLocation: string;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function DashboardLayout({
  children,
  userName,
  userLocation,
  pageTitle,
  pageSubtitle,
}: DashboardLayoutProps) {
  const { isLoading } = useLoadingOverlay();

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors">
      <Sidebar />
      <div
        className="flex-1 flex flex-col"
        style={{ marginLeft: "var(--sidebar-current-width, var(--sidebar-collapsed))" }}
      >
        <Header
          userName={userName}
          userLocation={userLocation}
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
        />
        <main className="relative flex-1 overflow-auto bg-background">
          {isLoading && (
            <div className="pointer-events-none absolute inset-0 z-20 bg-[#030303]/90 backdrop-blur-sm">
              <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_1fr]">
                  <Skeleton className="h-12 rounded-xl bg-[#0c0c0c] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
                  <Skeleton className="h-12 rounded-xl bg-[#0c0c0c] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Skeleton className="h-28 rounded-2xl bg-[#0b0b0b] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
                  <Skeleton className="h-28 rounded-2xl bg-[#0b0b0b] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
                  <Skeleton className="h-28 rounded-2xl bg-[#0b0b0b] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.3fr_1fr]">
                  <Skeleton className="h-80 rounded-2xl bg-gradient-to-br from-[#0f0f0f] via-[#0b0b0b] to-[#0d0d0d] shadow-[0_24px_50px_rgba(0,0,0,0.6)]" />
                  <Skeleton className="h-80 rounded-2xl bg-[#0b0b0b] shadow-[0_24px_50px_rgba(0,0,0,0.6)]" />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Skeleton className="h-48 rounded-2xl bg-[#0b0b0b] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
                  <Skeleton className="h-48 rounded-2xl bg-[#0b0b0b] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
                  <Skeleton className="h-48 rounded-2xl bg-[#0b0b0b] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Skeleton className="h-52 rounded-2xl bg-[#0b0b0b] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
                  <Skeleton className="h-52 rounded-2xl bg-[#0b0b0b] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
                </div>
              </div>
            </div>
          )}

          <div className={cn("transition duration-200", isLoading && "blur-[1.5px] opacity-60")}>
            <KycReminder />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
