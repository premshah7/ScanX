import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { FingerprintProvider } from "@/components/FingerprintProvider";
import NextAuthSessionProvider from "@/components/SessionProvider";
import { Toaster } from "sonner";
import { Analytics } from '@vercel/analytics/next';
import { NavigationLoader } from "@/components/NavigationLoader";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScanX",
  description: "Fast, Smart, Seamless attendance",

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

export const viewport = {
  themeColor: "#000000",
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
       <head>
        <Script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthSessionProvider>
          <NavigationLoader />
          <FingerprintProvider>
            <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            >
            {/* <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            > */}
              {children}
              <Analytics />
              <Toaster richColors position="top-center" />
            </ThemeProvider>
          </FingerprintProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
