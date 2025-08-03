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
