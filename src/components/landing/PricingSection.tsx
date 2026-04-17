"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  monthly: string;
  annual: string;
  period: string;
  desc: string;
  features: string[];
  featured: boolean;
  btnLabel: string;
  btnClass: string;
}

const plans: Plan[] = [
  {
    name: "Forever Free",
    monthly: "Free",
    annual: "Free",
    period: "",
    desc: "For stores just getting started.",
    features: [
      "Up to 60 Orders per Month",
      "New Form Design (Drag & Drop)",
      "Multi-currency Support",
      "Quantity Offers",
      "Upsells",
      "Downsells",
      "SMS Notifications",
      "Basic Fraud Prevention",
      "Address Validation by Google",
      "Abandoned Cart Recovery",
      "Insights & Analytics Dashboard",
      "Google Sheets Integration",
      "Ad Tracking Pixels",
      "24/7 Email Support",
    ],
    featured: false,
    btnLabel: "Get Started",
    btnClass: "outline",
  },
  {
    name: "Premium",
    monthly: "$6.99",
    annual: "$5.17",
    period: "/month",
    desc: "Growing stores that need more power.",
    features: [
      "Up to 200 Orders per Month",
      "WhatsApp & SMS Messaging",
      "New Form Design + (Drag & Drop)",
      "Modern Animations & Templates",
      "Personalized Coverages",
      "Quantity Offers on Product Page",
      "Advanced Fraud Prevention",
      "24/7 Live Chat Support",
      "Address Validation by Google",
      "Abandoned Cart Recovery",
      "Upsells",
      "Downsells",
      "SMS Notifications",
      "Insights & Analytics Dashboard",
      "Google Sheets Integration",
      "Ad Tracking Pixels",
    ],
    featured: true,
    btnLabel: "Start Free Trial",
    btnClass: "orange",
  },
  {
    name: "Enterprise",
    monthly: "$18.99",
    annual: "$14.05",
    period: "/month",
    desc: "Scaling brands maximizing every visit.",
    features: [
      "10,000 Orders per Month",
      "Custom Code Assistance",
      "Priority Live Chat Support (< 5 min)",
      "WhatsApp & SMS Messaging",
      "New Form Design (Drag & Drop)",
      "Modern Animations & Templates",
      "Personalized Coverages",
      "Quantity Offers on Product Page",
      "Advanced Fraud Prevention",
      "Address Validation by Google",
      "Abandoned Cart Recovery",
      "Upsells",
      "Downsells",
      "SMS Notifications",
      "Insights & Analytics Dashboard",
      "Google Sheets Integration",
      "Ad Tracking Pixels",
    ],
    featured: false,
    btnLabel: "Start Free Trial",
    btnClass: "teal",
  },
  {
    name: "Unlimited",
    monthly: "$43.99",
    annual: "$32.55",
    period: "/month",
    desc: "For brands that demand the absolute best.",
    features: [
      "Unlimited Orders per Month",
      "A/B Testing for 1-Click Upsells",
      "All Product Recommendations",
      "Form Designing per Product",
      "Advanced Analytics & Reports",
      "Custom Code Assistance",
      "WhatsApp & SMS Messaging",
      "Priority Live Chat Support (< 5 min)",
      "Personalized Coverages",
      "Advanced Fraud Prevention",
      "New Form Design (Drag & Drop)",
      "Modern Animations & Templates",
      "Quantity Offers on Product Page",
      "Address Validation by Google",
      "Abandoned Cart Recovery",
      "Upsells",
      "Downsells",
      "SMS Notifications",
      "Insights & Analytics Dashboard",
      "Google Sheets Integration",
      "Ad Tracking Pixels",
    ],
    featured: false,
    btnLabel: "Start Free Trial",
    btnClass: "outline",
  },
];

function getBtnClassName(btnClass: string, featured: boolean) {
  const base = buttonVariants({
    variant: btnClass === "outline" ? "outline" : "default",
    size: "sm",
  });
  if (btnClass === "orange") return cn(base, "w-full bg-orange-600 hover:bg-orange-700 text-white");
  if (btnClass === "teal") return cn(base, "w-full bg-teal-600 hover:bg-teal-700 text-white");
  if (featured) return cn(base, "w-full border-white/20 text-white hover:bg-white/10");
  return cn(base, "w-full");
}

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-24" id="pricing">
      <div className="max-w-[1160px] mx-auto px-6">
        <div className="text-center mb-8 reveal">
          <p className="text-xs font-bold tracking-widest uppercase text-teal-600 mb-3">
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            Simple, Transparent <span className="text-teal-600">Pricing</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Start free. Upgrade when you see results. No hidden fees.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <span
            className={`text-sm font-semibold cursor-pointer transition-colors ${
              !isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
            onClick={() => setIsAnnual(false)}
          >
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            id="pricing-toggle"
            size="default"
            className="data-[state=checked]:bg-teal-500"
          />
          <span
            className={`text-sm font-semibold cursor-pointer transition-colors ${
              isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
            onClick={() => setIsAnnual(true)}
          >
            Annual
          </span>
        </div>

        <p className="text-sm text-muted-foreground text-center mb-8">
          {isAnnual ? "You\u2019re saving " : "Pay annually and save up to "}
          <span className="font-bold text-orange-600">26%</span>
          {isAnnual ? " with annual billing" : ""}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-border rounded-xl overflow-hidden bg-card reveal">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-7 border-b lg:border-b-0 lg:border-r border-border last:border-r-0 last:border-b-0 ${
                plan.featured ? "bg-gray-800 text-white" : "bg-card"
              }`}
              id={`pricing-${plan.name.toLowerCase().replace(/\s/g, "-")}`}
            >
              {plan.featured && (
                <Badge className="absolute -top-0 left-1/2 -translate-x-1/2 bg-orange-500 hover:bg-orange-500 text-white text-[10px] font-bold tracking-wide uppercase rounded-b-md rounded-t-none px-3">
                  Most Popular
                </Badge>
              )}

              <p
                className={`text-[11px] font-bold tracking-widest uppercase mb-2 ${
                  plan.featured ? "text-white/60" : "text-muted-foreground"
                }`}
              >
                {plan.name}
              </p>

              <div className="flex items-baseline gap-2 mb-0.5">
                <span
                  className={`text-3xl font-black tracking-tight ${
                    plan.featured ? "text-white" : "text-foreground"
                  }`}
                >
                  {plan.monthly === "Free"
                    ? "Free"
                    : isAnnual
                      ? plan.annual
                      : plan.monthly}
                </span>
                {isAnnual && plan.monthly !== "Free" && (
                  <span
                    className={`text-sm font-semibold line-through ${
                      plan.featured ? "text-white/60" : "text-muted-foreground/60"
                    }`}
                  >
                    {plan.monthly}
                  </span>
                )}
              </div>

              <p
                className={`text-xs mb-1 ${
                  plan.featured ? "text-white/50" : "text-muted-foreground"
                }`}
              >
                {plan.monthly === "Free" ? "" : plan.period}
              </p>

              <p
                className={`text-xs mb-5 leading-relaxed ${
                  plan.featured ? "text-white/50" : "text-muted-foreground"
                }`}
              >
                {plan.desc}
              </p>

              <div className="flex flex-col gap-2.5 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 text-[13px] leading-snug ${
                      plan.featured ? "text-white/75" : "text-muted-foreground"
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                        plan.featured ? "text-orange-500" : "text-teal-500"
                      }`}
                      weight="bold"
                    />
                    {f}
                  </div>
                ))}
              </div>

              <a
                href="#cta"
                className={getBtnClassName(plan.btnClass, plan.featured)}
              >
                {plan.btnLabel}
              </a>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-5 leading-relaxed">
          * All charges are billed in USD.
          <br />
          ** Recurring charges, including monthly or usage-based charges, are billed every 30 days.
        </p>
      </div>
    </section>
  );
}
