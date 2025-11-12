import Sidebar from "./Sidebar";
import Header from "./Header";

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
    <div className="flex h-screen bg-background text-foreground transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-20">
        <Header
          userName={userName}
          userLocation={userLocation}
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
        />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
