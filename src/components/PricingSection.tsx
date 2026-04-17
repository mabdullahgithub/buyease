"use client";

import { useState } from "react";

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

interface Plan {
  name: string;
  monthly: string;
  annual: string;
  period: string;
  annualPeriod: string;
  desc: string;
  features: string[];
  featured: boolean;
  btnLabel: string;
  btnStyle: string;
}

const plans: Plan[] = [
  {
    name: "Forever Free",
    monthly: "Free",
    annual: "Free",
    period: "",
    annualPeriod: "",
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
    btnStyle: "btn btn-secondary",
  },
  {
    name: "Premium",
    monthly: "$7.99",
    annual: "$5.99",
    period: "/month",
    annualPeriod: "/month",
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
    btnStyle: "btn btn-orange",
  },
  {
    name: "Enterprise",
    monthly: "$24.99",
    annual: "$18.49",
    period: "/month",
    annualPeriod: "/month",
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
    btnStyle: "btn btn-primary",
  },
  {
    name: "Unlimited",
    monthly: "$54.99",
    annual: "$40.99",
    period: "/month",
    annualPeriod: "/month",
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
    btnStyle: "btn btn-secondary",
  },
];

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <div className="pricing-header reveal">
          <span className="section-label">Pricing</span>
          <h2 className="section-title">
            Simple, Transparent <span>Pricing</span>
          </h2>
          <p className="section-subtitle">
            Start free. Upgrade when you see results. No hidden fees.
          </p>
        </div>

        <div className="pricing-toggle">
          <span
            className={`pricing-toggle-label${!isAnnual ? " active" : ""}`}
            onClick={() => setIsAnnual(false)}
          >
            Monthly
          </span>
          <button
            className={`pricing-toggle-switch${isAnnual ? " active" : ""}`}
            onClick={() => setIsAnnual(!isAnnual)}
            aria-label="Toggle annual pricing"
            id="pricing-toggle"
          >
            <span className="pricing-toggle-knob" />
          </button>
          <span
            className={`pricing-toggle-label${isAnnual ? " active" : ""}`}
            onClick={() => setIsAnnual(true)}
          >
            Annual
          </span>
        </div>

        <p className="pricing-annual-note">
          {isAnnual
            ? "You're saving "
            : "Pay annually and save up to "}
          <strong>26%</strong>
          {isAnnual ? " with annual billing" : ""}
        </p>

        <div className="pricing-grid reveal">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card${plan.featured ? " featured" : ""}`}
              id={`pricing-${plan.name.toLowerCase().replace(/\s/g, "-")}`}
            >
              {plan.featured && (
                <span className="pricing-popular-tag">Most Popular</span>
              )}

              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">
                {plan.monthly === "Free" ? (
                  <span className="pricing-amount">Free</span>
                ) : (
                  <>
                    <span className="pricing-amount">
                      {isAnnual ? plan.annual : plan.monthly}
                    </span>
                  </>
                )}
              </div>
              <div className="pricing-period">
                {plan.monthly === "Free"
                  ? ""
                  : isAnnual
                    ? plan.annualPeriod
                    : plan.period}
              </div>

              <p className="pricing-desc">{plan.desc}</p>

              <div className="pricing-features-list">
                {plan.features.map((f, i) => (
                  <div className="pricing-feature-item" key={i}>
                    <span className="pricing-check">
                      <CheckIcon />
                    </span>
                    {f}
                  </div>
                ))}
              </div>

              <a href="#cta" className={plan.btnStyle} id={`pricing-btn-${plan.name.toLowerCase().replace(/\s/g, "-")}`}>
                {plan.btnLabel}
              </a>
            </div>
          ))}
        </div>

        <p className="footer-bottom-note" style={{ marginTop: "20px" }}>
          * All charges are billed in USD.
          <br />
          ** Recurring charges, including monthly or usage-based charges, are billed every 30 days.
        </p>
      </div>
    </section>
  );
}
