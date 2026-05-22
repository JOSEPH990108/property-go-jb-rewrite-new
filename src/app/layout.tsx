// src\app\layout.tsx
import type { Metadata, Viewport } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { SmoothScroll } from "@/components/shared/SmoothScroll";
import { Toaster } from "@/components/ui/sonner";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { GlobalLoader } from "@/components/shared/GlobalLoader";
import ThemeTogglerTwo from "@/components/layout/ThemeTogglerTwo";
import { ThemeProvider } from "@/hooks/useTheme";
import LoginModal from "@/components/auth/LoginModal";
import { ScrollLoginTrigger } from "@/components/shared/ScrollLoginTrigger";
import OnboardingModal from "@/components/auth/OnboardingModal";
import { TooltipProvider } from "@/components/ui/tooltip";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PropertyGoJB - Premier Johor Real Estate",
    template: "%s | PropertyGoJB",
  },
  description: "Discover the finest properties in Johor Bahru. Search new launches, condos, and landed homes with real-time availability.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://propertygojb.com"),
  openGraph: {
    type: "website",
    locale: "en_MY",
    siteName: "PropertyGoJB",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F6F0" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/logo/icon-192.png" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          lato.variable
        )}
      >
        <ThemeProvider>
          <TooltipProvider delayDuration={200}>
          <SmoothScroll>
            <CustomCursor />
            <ScrollLoginTrigger />

            {children}
            
            <LoginModal />
            <OnboardingModal />
            <div className="fixed z-50 transition-all duration-300 bottom-32 right-6 md:bottom-6">
              <ThemeTogglerTwo />
            </div>
            <Toaster />
            <GlobalLoader />
          </SmoothScroll>
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}