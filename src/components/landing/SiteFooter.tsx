import { ShoppingCartSimple, TwitterLogo, LinkedinLogo, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { Separator } from "@/components/ui/separator";

export default function SiteFooter() {
  return (
    <footer className="relative pt-14 pb-7 border-t border-border overflow-hidden" id="footer">
      {/* Background Dotted Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-0 opacity-[0.08] dark:opacity-[0.05] select-none text-foreground">
        <div
          className="text-6xl md:text-8xl lg:text-9xl font-black leading-none whitespace-nowrap tracking-tighter"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 2px, transparent 2px)",
            backgroundSize: "6px 6px",
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
            <div className="flex items-center gap-2.5 text-lg font-extrabold mb-3">
              <span className="w-7 h-7 rounded-md bg-teal-600 flex items-center justify-center text-white">
                <ShoppingCartSimple className="w-3.5 h-3.5" weight="duotone" />
              </span>
              BuyEase
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI&#8209;powered commerce tools helping Shopify merchants sell smarter, not harder.
            </p>
          </div>
          {[
            { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "How It Works", href: "#how-it-works" }, { label: "Changelog", href: "#" }] },
            { title: "Company", links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Careers", href: "#" }, { label: "Contact", href: "#" }] },
            { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy-policy" }, { label: "Terms of Service", href: "/terms-of-service" }, { label: "Cookie Policy", href: "/cookie-policy" }] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4">{col.title}</h4>
              {col.links.map((link) => (
                <a key={link.label} href={link.href} className="block text-sm text-muted-foreground mb-2.5 hover:text-teal-600 transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <Separator className="mb-5" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">&copy; 2026 BuyEase. All rights reserved.</p>
          <div className="flex gap-2">
            {[
              { label: "Twitter", icon: <TwitterLogo weight="fill" /> },
              { label: "LinkedIn", icon: <LinkedinLogo weight="fill" /> },
              { label: "GitHub", icon: <GithubLogo weight="fill" /> },
            ].map((social) => (
              <a 
                key={social.label} 
                href="#" 
                className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:border-teal-500 hover:text-teal-600 transition-all text-base" 
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
