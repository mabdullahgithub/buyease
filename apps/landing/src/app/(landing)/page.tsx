import WaitlistForm from "@/components/landing/WaitlistForm";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingShowcase from "@/components/landing/PricingShowcase";
import HeroDashboard from "@/components/landing/HeroDashboard";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative pt-36 pb-12 lg:pb-16 overflow-hidden" id="hero">
        <div className="absolute inset-0 pointer-events-none dark:hidden">
          <div className="absolute -top-32 -right-16 w-[400px] h-[400px] rounded-full bg-teal-100 blur-[80px] opacity-50" />
          <div className="absolute -bottom-16 -left-10 w-[280px] h-[280px] rounded-full bg-orange-100 blur-[80px] opacity-50" />
        </div>

        <div className="relative z-10 max-w-[1160px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="hero-enter hero-enter-d1 mb-12 mt-6 flex justify-center lg:justify-start" id="hero-badge">
              <div className="relative inline-flex -rotate-[8deg] drop-shadow-2xl">
                {/* Banner left bottom fold */}
                <div className="absolute left-0 top-full z-0 h-4 w-5 bg-orange-800 [clip-path:polygon(0_0,100%_0,100%_100%)]" />
                
                {/* Main ribbon shape */}
                <div className="relative z-10 flex items-center bg-orange-500 py-2.5 pl-6 pr-10 [clip-path:polygon(0_0,100%_0,88%_50%,100%_100%,0_100%)]">
                  <span className="text-base sm:text-lg lg:text-xl font-black uppercase tracking-[0.15em] text-white drop-shadow-md">
                    AI Powered
                  </span>
                </div>
              </div>
            </div>

            <h1 
              className="hero-enter hero-enter-d2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-5 max-w-2xl mx-auto lg:mx-0 drop-shadow-sm"
              style={{ WebkitTextStroke: "1px currentColor" }}
            >
              BuyEase COD Form &amp;{" "}
              <span className="text-teal-600">Upsells</span>
            </h1>

            <p className="hero-enter hero-enter-d3 text-lg text-muted-foreground max-w-xl leading-relaxed mb-9 mx-auto lg:mx-0">
              Boost your sales by creating 1 click COD order form with upsells,
              offers, and more!
            </p>

            <div className="hero-enter hero-enter-d4 flex items-center gap-3 flex-wrap justify-center lg:justify-start mb-12">
              <a
                href="#cta"
                id="hero-cta-primary"
                className={cn(buttonVariants({ size: "default" }), "bg-teal-600 hover:bg-teal-700 text-white")}
              >
                Get Early Access
              </a>
              <a
                href="#features"
                id="hero-cta-secondary"
                className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              >
                See Features
              </a>
            </div>

            {/* Stats */}
            <div className="hero-enter hero-enter-d5 flex items-center gap-10 pt-8 border-t border-border flex-wrap justify-center lg:justify-start">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-extrabold text-teal-600 tracking-tight">32%</div>
                <div className="text-xs text-muted-foreground mt-0.5">Avg. Revenue Lift</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-extrabold text-teal-600 tracking-tight">5,000+</div>
                <div className="text-xs text-muted-foreground mt-0.5">Beta Merchants</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-extrabold text-teal-600 tracking-tight">2.4s</div>
                <div className="text-xs text-muted-foreground mt-0.5">Setup Time</div>
              </div>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="hero-enter hero-enter-d5 w-full max-w-[920px] mx-auto lg:mx-0 lg:justify-self-end">
            <HeroDashboard />
          </div>
        </div>
      </section>

      {/* Small Dotted Text Marquee */}
      <div className="w-full overflow-hidden pointer-events-none opacity-[0.15] dark:opacity-[0.08] select-none flex items-center justify-center text-foreground z-0 py-4 -mt-8 -mb-17 mask-radial-faded">
        {/* A single wrapper moving from 0 to -50% */}
        <div className="flex w-[200%] animate-marquee gap-8">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="text-4xl md:text-[3rem] tracking-tighter leading-none whitespace-nowrap"
              style={{
                fontFamily: "'Arial Black', Impact, sans-serif",
                fontWeight: 900,
                backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                backgroundSize: "3px 3px",
                backgroundPosition: "0 0",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "inherit",
              }}
            >
              BUYEASE
            </div>
          ))}
        </div>
      </div>

      <FeaturesSection />

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-24" id="how-it-works">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-bold tracking-widest uppercase text-teal-600 mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              Live in <span className="text-teal-600">Three Simple Steps</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              No developers required. No complicated setup. Just install, connect, and start selling smarter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-0.5 bg-border" />
            {[
              { num: "1", title: "Install the App", desc: "One click from the Shopify App Store. BuyEase automatically syncs with your product catalog and store data." },
              { num: "2", title: "AI Does the Work", desc: "Our engine analyzes your traffic patterns and customer segments to build personalized strategies within minutes." },
              { num: "3", title: "Watch Revenue Grow", desc: "Sit back as intelligent upsells, bundles, and recommendations drive conversions on complete autopilot." },
            ].map((step, i) => (
              <div key={step.num} className={`text-center relative reveal reveal-d${i + 1}`} id={`step-${step.num}`}>
                <div className="size-20 rounded-full bg-card border-2 border-border flex items-center justify-center mx-auto mb-5 relative z-10 hover:border-teal-500 hover:shadow-md transition-all duration-300">
                  <span className="text-2xl font-black text-teal-600">{step.num}</span>
                </div>
                <h3 className="text-base font-bold mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[250px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <PricingSection />

      <PricingShowcase />

      {/* ==================== FAQ ==================== */}
      <FaqSection />

      {/* ==================== CTA ==================== */}
      <section className="py-24" id="cta">
        <div className="max-w-[1160px] mx-auto px-6">
          <Card className="glass-surface-strong shadow-md reveal">
            <CardContent className="py-16 px-8 text-center flex flex-col items-center">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                Ready to <span className="text-teal-600">Supercharge</span> Your Store?
              </h2>
              <p className="text-base text-muted-foreground max-w-md leading-relaxed mb-8">
                Join 5,000+ merchants on the waitlist. Be the first to launch
                with BuyEase when we go live on the Shopify App Store.
              </p>
              <WaitlistForm id="waitlist-form" />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
