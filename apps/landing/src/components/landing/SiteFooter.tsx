import Link from "next/link";
import { BrandLogo } from "@/components/landing/brand-logo";
import { Separator } from "@/components/ui/separator";
import { TwitterIcon, LinkedinIcon, GithubIcon } from "@/components/ui/social-icons";

export default function SiteFooter() {
  return (
    <footer className="relative pt-14 pb-7 border-t border-border overflow-hidden" id="footer">
      {/* Background Dotted Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-0 opacity-[0.12] dark:opacity-[0.05] select-none text-foreground">
        <div
          className="text-6xl md:text-8xl lg:text-9xl leading-none whitespace-nowrap tracking-tighter"
          style={{
            fontFamily: "'Arial Black', Impact, sans-serif",
            fontWeight: 900,
            backgroundImage: "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "4px 4px",
            backgroundPosition: "0 0",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "inherit",
          }}
        >
          BUYEASE
        </div>
      </div>

      <div className="relative max-w-[1160px] mx-auto px-6 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12">
          <div className="max-w-[260px]">
            <div className="mb-3 flex items-center">
              <BrandLogo href="/" width={160} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI&#8209;powered commerce tools helping Shopify merchants sell smarter, not harder.
            </p>
          </div>
          {[
            { title: "Product", links: [{ label: "Features", href: "/#features" }, { label: "Pricing", href: "/#pricing" }, { label: "How It Works", href: "/#how-it-works" }, { label: "Changelog", href: "#" }] },
            { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Careers", href: "/careers" }, { label: "Contact", href: "/contact" }] },
            { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy-policy" }, { label: "Terms of Service", href: "/terms-of-service" }, { label: "Cookie Policy", href: "/cookie-policy" }, { label: "Data Processing", href: "/dpa" }] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-foreground">{col.title}</h4>
              {col.links.map((link) => (
                <Link key={link.label} href={link.href} className="block text-sm text-muted-foreground mb-2.5 hover:text-teal-600 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <Separator className="mb-5" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">&copy; 2026 BuyEase. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a
              href="mailto:support@buyease.app"
              className="text-xs text-muted-foreground hover:text-teal-600 transition-colors"
              aria-label="Email BuyEase support"
            >
              support@buyease.app
            </a>
            <div className="flex gap-2">
            {[
              { label: "Twitter", icon: <TwitterIcon className="size-4" /> },
              { label: "LinkedIn", icon: <LinkedinIcon className="size-4" /> },
              { label: "GitHub", icon: <GithubIcon className="size-4" /> },
            ].map((social) => (
              <a 
                key={social.label} 
                href="#" 
                className="size-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:border-teal-500 hover:text-teal-600 transition-all text-base" 
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
