import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Job Application Tool | The Job Helpers",
  description: "Find your dream job with TheJobHelpers — powered by LinkedIn, Indeed, and Google job search.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[100dvh] transition-colors duration-500`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="relative overflow-hidden min-h-[100dvh] bg-background text-foreground transition-colors duration-500">
            <div className="pointer-events-none fixed inset-0 -z-10">
              <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-3xl" />
              <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl" />
              <div className="absolute -bottom-40 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl" />
            </div>

            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
