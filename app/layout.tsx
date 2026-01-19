import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FingerprintProvider } from "@/components/FingerprintProvider";
import NextTopLoader from "nextjs-toploader";
import NextAuthSessionProvider from "@/components/SessionProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GeoGuard Attendance",
  description: "Secure GPS & Device-Locked Attendance System",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GeoGuard",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zooming for app-like feel
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader color="#3B82F6" height={0} showSpinner={true} shadow={false} />
        <NextAuthSessionProvider>
          <FingerprintProvider>
            {children}
          </FingerprintProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
