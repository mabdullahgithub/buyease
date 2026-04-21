"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: Exclude<Theme, "system">;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): Exclude<Theme, "system"> {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(defaultTheme: Theme): Theme {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  const stored = window.localStorage.getItem("buyease-theme");
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return defaultTheme;
}

function applyTheme(theme: Theme, enableSystem: boolean): Exclude<Theme, "system"> {
  const resolvedTheme: Exclude<Theme, "system"> =
    theme === "system" && enableSystem ? getSystemTheme() : theme === "system" ? "dark" : theme;
  const root = document.documentElement;
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.classList.toggle("light", resolvedTheme === "light");
  return resolvedTheme;
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }
  return context;
}

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<Exclude<Theme, "system">>(
    defaultTheme === "system" ? "dark" : defaultTheme
  );

  React.useEffect(() => {
    const storedTheme = getStoredTheme(defaultTheme);
    setThemeState(storedTheme);
    setResolvedTheme(applyTheme(storedTheme, enableSystem));
  }, [defaultTheme, enableSystem]);

  React.useEffect(() => {
    const root = document.documentElement;
    if (disableTransitionOnChange) {
      root.classList.add("theme-transition-disabled");
    }

    const nextResolvedTheme = applyTheme(theme, enableSystem);
    setResolvedTheme(nextResolvedTheme);
    window.localStorage.setItem("buyease-theme", theme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system" && enableSystem) {
        setResolvedTheme(applyTheme("system", enableSystem));
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      root.classList.remove("theme-transition-disabled");
    };
  }, [disableTransitionOnChange, enableSystem, theme]);

  const setTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
  }, []);

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, theme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
