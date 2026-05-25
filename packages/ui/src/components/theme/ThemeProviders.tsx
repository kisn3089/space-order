"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster, ToasterProps } from "../sonner";

export function NextThemeProviders({
  children,
  options,
}: {
  children: React.ReactNode;
  options?: ToasterProps;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // disableTransitionOnChange
      enableColorScheme
    >
      <Toaster {...options} />
      {children}
    </NextThemesProvider>
  );
}
