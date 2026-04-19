"use client";

import { Star, Rocket, TrendingUp, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── testimonials split into two columns ── */
const LEFT_TESTIMONIALS = [
  { initials: "SL", name: "Sarah Lin", role: "Founder, Glow Botanics", text: "We saw a 28% lift in average order value within the first week. BuyEase\u2019s recommendations feel like magic \u2014 our customers love the personalized experience.", color: "teal" as const },
  { initials: "PR", name: "Priya Rao", role: "Head of Ecom, FitNest", text: "The A/B testing alone paid for a year of BuyEase. We discovered that a simple bundle re-order increased conversions by 41%.", color: "teal" as const },
  { initials: "EM", name: "Emily Moore", role: "Marketing Director, BeautyBox", text: "This tool paid for itself on day one. Setting up the post-purchase upsells took practically zero effort and the ROI is massive.", color: "orange" as const },
  { initials: "AM", name: "Alicia Miller", role: "Ecom Manager, FreshFinds", text: "The data analytics are incredibly detailed without being overwhelming. Helped us tune our offers perfectly for our target audience.", color: "teal" as const },
  { initials: "CH", name: "Chris Harper", role: "Founder, Peak Performance", text: "Finally an app that understands what high-volume COD merchants actually need. Five stars for the SMS automations alone.", color: "orange" as const },
];

const RIGHT_TESTIMONIALS = [
  { initials: "MK", name: "Marcus Kim", role: "CEO, UrbanThread Co.", text: "Setup took literally seconds. No code, no theme edits, just pure results. Our upsell revenue went from $0 to $8k/month without lifting a finger.", color: "orange" as const },
  { initials: "JD", name: "John Doe", role: "Owner, JD Sports", text: "I can\u2019t imagine running my store without it now. The integration was seamless, and the extra features are a game changer.", color: "teal" as const },
  { initials: "DT", name: "David Thorne", role: "Co-Founder, TechGeeks", text: "Exceptional support and an incredibly intuitive interface. We saw a solid 15% increase in conversions immediately after launch.", color: "orange" as const },
  { initials: "RJ", name: "Robert Jones", role: "CEO, NextGen Retail", text: "We swapped out three other apps just to use BuyEase. It\u2019s lightning fast and the customized checkouts are simply brilliant.", color: "teal" as const },
];

/* ── testimonial card ── */
function TestimonialCard({ t }: { t: (typeof LEFT_TESTIMONIALS)[0] }) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card mb-4 transition-shadow duration-300">
      <div className="flex gap-0.5 text-orange-500 mb-3">
        {[...Array(5)].map((_, j) => (
          <Star key={j} className="size-3.5 fill-current" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        &ldquo;{t.text}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "size-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
            t.color === "teal"
              ? "bg-teal-100 text-teal-700"
              : "bg-orange-100 text-orange-700"
          )}
        >
          {t.initials}
        </div>
        <div>
          <p className="text-sm font-bold leading-none">{t.name}</p>
          <p className="text-xs text-muted-foreground leading-none mt-0.5">
            {t.role}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── scrolling column wrapper ── */
function ScrollColumn({
  items,
  direction,
}: {
  items: typeof LEFT_TESTIMONIALS;
  direction: "up" | "down";
}) {
  const doubled = [...items, ...items];

  return (
    <div className="relative h-full overflow-hidden group">
      {/* Gradient fade masks */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

      <div
        className={
          direction === "up"
            ? "testimonial-scroll-up"
            : "testimonial-scroll-down"
        }
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={`${direction}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

/* ── center marketing card ── */
function CenterCard() {
  return (
    <div className="self-center w-full">
      <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden relative">
        <div className="p-8 flex flex-col items-center text-center">
          {/* Animated icon */}
          <div className="relative mb-6">
            <div className="size-20 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center feature-icon-loop">
              <Rocket className="size-10 text-teal-600" strokeWidth={1.5} />
            </div>
            {/* Floating sparkle accents */}
            <div className="absolute -top-1 -right-1 size-5 rounded-full bg-orange-100 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-700 flex items-center justify-center">
              <Zap className="size-3 text-orange-500" strokeWidth={2.5} />
            </div>
          </div>

          {/* Catchy headline */}
          <h3 className="text-2xl font-black tracking-tight leading-tight mb-2">
            Stop Losing
            <br />
            <span className="text-teal-600">Revenue</span> Today
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-[260px]">
            Join 5,000+ Shopify merchants already using AI-powered upsells to
            turn every order into maximum profit.
          </p>

          {/* Stats row */}
          <div className="w-full grid grid-cols-3 gap-3 mb-6">
            <div className="flex flex-col items-center p-3 rounded-lg bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50">
              <TrendingUp className="size-4 text-teal-600 mb-1.5" strokeWidth={2.5} />
              <span className="text-lg font-black text-teal-600 leading-none">32%</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Avg. Lift</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-orange-50/60 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50">
              <Zap className="size-4 text-orange-500 mb-1.5" strokeWidth={2.5} />
              <span className="text-lg font-black text-orange-500 leading-none">2.4s</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Setup</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50">
              <ShieldCheck className="size-4 text-teal-600 mb-1.5" strokeWidth={2.5} />
              <span className="text-lg font-black text-teal-600 leading-none">99%</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Uptime</span>
            </div>
          </div>

          {/* CTA button */}
          <a
            href="#cta"
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full bg-teal-600 hover:bg-teal-700 text-white font-bold gap-2 group/btn"
            )}
          >
            Get Early Access
            <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
          </a>

          <p className="text-[11px] text-muted-foreground mt-3">
            Free forever plan available &bull; No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── main component ── */
export default function PricingShowcase() {
  return (
    <section className="py-24 overflow-hidden" id="testimonials">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section heading */}
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-bold tracking-widest uppercase text-teal-600 mb-3">
            Social Proof
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Loved by{" "}
            <span className="text-teal-600">Merchants Worldwide</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Don&apos;t just take our word for it &mdash; hear what early beta
            merchants are saying.
          </p>
        </div>

        {/* ─── Desktop: 3-column layout ─── */}
        <div
          className="hidden lg:grid grid-cols-[1fr_360px_1fr] gap-6 items-center"
          style={{ height: "660px" }}
        >
          {/* Left scrolling testimonials */}
          <ScrollColumn items={LEFT_TESTIMONIALS} direction="up" />

          {/* Center marketing card */}
          <CenterCard />

          {/* Right scrolling testimonials */}
          <ScrollColumn items={RIGHT_TESTIMONIALS} direction="down" />
        </div>

        {/* ─── Mobile / Tablet: stacked layout ─── */}
        <div className="lg:hidden">
          {/* Marketing card */}
          <div className="max-w-sm mx-auto mb-12">
            <CenterCard />
          </div>

          {/* Testimonials grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...LEFT_TESTIMONIALS, ...RIGHT_TESTIMONIALS].map((t, i) => (
              <TestimonialCard key={`mobile-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
