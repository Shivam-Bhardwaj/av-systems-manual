import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Navigation } from "@/components/layout/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AV Systems Manual",
  description: "Professional Audio-Visual System Specification Generator and Engineering Manual",
  keywords: ["AV systems", "audio engineering", "speaker calculator", "RT60", "SPL", "acoustic design"],
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'hi' }]
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <div className="flex h-screen bg-background">
          {/* Sidebar Navigation */}
          <aside className="w-64 border-r bg-muted/10">
            <div className="flex h-full flex-col">
              <div className="p-6">
                <h1 className="text-xl font-bold">AV Systems Manual</h1>
                <p className="text-sm text-muted-foreground mt-1">Engineering Reference</p>
              </div>
              <div className="flex-1 px-3 py-2">
                <Navigation />
              </div>
              <div className="p-4 border-t flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Version 1.0.0 | © 2024
                </p>
                <LanguageSwitcher />
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto py-8 px-4 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
