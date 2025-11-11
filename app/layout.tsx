import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AV Systems Manual",
  description: "Professional Audio-Visual System Specification Generator and Engineering Manual",
  keywords: ["AV systems", "audio engineering", "speaker calculator", "RT60", "SPL", "acoustic design"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
              <div className="p-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Version 1.0.0 | © 2024
                </p>
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
