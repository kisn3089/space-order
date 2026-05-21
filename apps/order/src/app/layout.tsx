import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@spaceorder/ui/globals.css";
import TanstackProvider from "@spaceorder/api/core/TanstackProvider";
import { Toaster } from "@spaceorder/ui/components/sonner";
import { NextThemeProviders } from "@spaceorder/ui/components/theme/ThemeProviders";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "주문 서비스 - TADER",
  description: "고객이 주문하는 애플리케이션 서비스입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased max-w-2xl min-h-dvh mx-auto`}
      >
        <NextThemeProviders>
          <TanstackProvider>{children}</TanstackProvider>
          <Toaster
            mobileOffset={{ left: "60px", right: "60px" }}
            position="top-center"
            richColors
          />
        </NextThemeProviders>
      </body>
    </html>
  );
}
