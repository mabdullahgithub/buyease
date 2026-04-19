"use client";

import { SessionProvider } from "next-auth/react";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

type AppSessionProviderProps = {
  children: React.ReactNode;
};

export function AppSessionProvider({ children }: AppSessionProviderProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delay={0}>{children}</TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
