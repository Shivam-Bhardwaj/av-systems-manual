import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Navigation } from "@/components/layout/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata: Metadata = {
  title: "AV Systems Manual",
  description: "Professional Audio-Visual System Specification Generator and Engineering Manual",
  keywords: ["AV systems", "audio engineering", "speaker calculator", "RT60", "SPL", "acoustic design"],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
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
        <MobileNav />
        <div className="flex h-screen bg-background">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block w-64 border-r bg-muted/10" aria-label="Main navigation">
            <nav className="flex h-full flex-col" aria-label="Site navigation">
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
            </nav>
          </aside>
          
          {/* Skip to main content link for accessibility */}
          <a 
            href="#main-content" 
            className="absolute left-[-9999px] focus:left-4 focus:top-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:not-sr-only"
          >
            Skip to main content
          </a>
          
          {/* Main Content */}
          <main id="main-content" className="flex-1 overflow-y-auto lg:ml-0" role="main" aria-label="Main content">
            <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
