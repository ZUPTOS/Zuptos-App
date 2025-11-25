'use client';

import DashboardLayout from "@/components/DashboardLayout";

interface AdminPlaceholderProps {
  title: string;
  description?: string;
}

export default function AdminPlaceholder({
  title,
  description = "Em breve teremos esta área disponível para administração."
}: AdminPlaceholderProps) {
  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle={`Admin ${title}`}>
      <div className="flex min-h-[60vh] flex-col items-start gap-3 px-6 py-10">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </DashboardLayout>
  );
}
