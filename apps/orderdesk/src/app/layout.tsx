import { Inter, JetBrains_Mono } from "next/font/google";
import "@spaceorder/ui/globals.css";
import TanstackProvider from "@spaceorder/api/core/TanstackProvider";
import React from "react";
import { OrderdeskAuthProvider } from "@/providers/OrderdeskAuthProvider";
import { NextThemeProviders } from "@spaceorder/ui/components/theme/ThemeProviders";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <OrderdeskAuthProvider>
          <TanstackProvider>
            <NextThemeProviders
              options={{
                position: "bottom-right",
                swipeDirections: ["right"],
              }}
            >
              {children}
            </NextThemeProviders>
          </TanstackProvider>
        </OrderdeskAuthProvider>
      </body>
    </html>
  );
}
