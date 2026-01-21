'use client';

import Sidebar from "./Sidebar";
import Header from "./Header";
import KycReminder from "@/shared/components/KycReminder";

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
  return (
    <div className="flex h-screen overflow-x-hidden bg-background text-foreground transition-colors">
      <Sidebar />
      <div
        className="flex-1 flex min-w-0 flex-col"
        style={{ paddingLeft: "var(--sidebar-current-width, var(--sidebar-collapsed))" }}
      >
        <Header
          userName={userName}
          userLocation={userLocation}
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
        />
        <main className="relative flex-1 overflow-auto bg-background overflow-x-hidden">
          <KycReminder />
          <div className="transition duration-200">{children}</div>
        </main>
      </div>
    </div>
  );
}
