"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Menu } from "lucide-react";
import ThemeToggle from "@/components/landing/ThemeToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-surface border-b border-border/55 py-2"
          : "glass-surface border-b border-border/35 py-3"
      }`}
      id="navbar"
    >
      <div className="max-w-[1160px] mx-auto px-6 flex items-center justify-between">
        <a
          href="#"
          className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-foreground"
          id="navbar-logo"
        >
          <span className="size-8 rounded-md bg-teal-600 flex items-center justify-center text-white">
            <ShoppingCart />
          </span>
          BuyEase
        </a>

        <div className="hidden md:flex items-center gap-8" id="navbar-links">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-teal-600 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-teal-600 transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-teal-600 transition-colors">
            Pricing
          </a>
          <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-teal-600 transition-colors">
            Reviews
          </a>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <a
            href="#cta"
            id="navbar-join-btn"
            className={cn(buttonVariants({ size: "xs" }), "bg-teal-600 hover:bg-teal-700 text-white")}
          >
            Join Waitlist
          </a>
        </div>

        <div className="md:hidden flex items-center gap-1.5">
          <ThemeToggle />
          <Button type="button" size="icon-xs" variant="outline" aria-label="Open menu" id="mobile-menu-btn">
            <Menu />
          </Button>
        </div>
      </div>
    </nav>
  );
}
