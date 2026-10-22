import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { FingerprintProvider } from "@/components/FingerprintProvider";
import NextAuthSessionProvider from "@/components/SessionProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { NavigationLoader } from "@/components/NavigationLoader";

const sans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ScanX — Academic Attendance Protocol",
  description: "Device-verified QR attendance system for higher education institutions.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ScanX",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F9FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0F141C" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${mono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-md focus:text-xs focus:font-medium"
        >
          Skip to main content
        </a>
        <NextAuthSessionProvider>
          <NavigationLoader />
          <FingerprintProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Analytics />
              <Toaster
                position="top-center"
                toastOptions={{
                  className: "border border-border bg-card text-card-foreground shadow-sm rounded-md text-sm",
                }}
              />
            </ThemeProvider>
          </FingerprintProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
