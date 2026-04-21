"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/components/theme-provider";

export function SonnerToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      theme={resolvedTheme}
      richColors={false}
      expand
      closeButton
      position="bottom-right"
      toastOptions={{
        className:
          "w-[280px] rounded-md border border-border/70 bg-card/65 px-3 py-2 text-sm text-card-foreground shadow-lg backdrop-blur-md",
        descriptionClassName: "text-[11px] text-muted-foreground",
      }}
    />
  );
}
