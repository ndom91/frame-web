import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"

import { ThemeProvider } from "@/app/lib/theme-provider"
import { QueryProvider } from "@/app/lib/query-client"
import "./globals.css";
export { viewport, metadata } from "@/app/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-background focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Skip to main content
        </a>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="bottom-center" />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
