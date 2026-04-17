"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

const THEME_KEY = "buyease-theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "dark" || stored === "light" ? stored : "light";
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <Button
      type="button"
      size="icon-xs"
      variant="ghost"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="text-muted-foreground hover:text-foreground"
    >
      <Sun className="size-3.5 hidden dark:block" />
      <Moon className="size-3.5 block dark:hidden" />
    </Button>
  );
}
