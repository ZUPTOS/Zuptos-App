import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Sora } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora"
});

export const metadata: Metadata = {
  title: "Zuptos Dashboard",
  description: "Dashboard administrativo da Zuptos",
  icons: {
    icon: "/images/logoSide.svg",
    shortcut: "/images/logoSide.svg",
    apple: "/images/logoSide.svg"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const fontClasses = `${sora.className} ${sora.variable}`;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`min-h-screen bg-background text-foreground transition-colors ${fontClasses}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
