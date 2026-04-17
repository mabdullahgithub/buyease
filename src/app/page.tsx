import Navbar from "@/components/Navbar";
import WaitlistForm from "@/components/WaitlistForm";
import ScrollReveal from "@/components/ScrollReveal";
import PricingSection from "@/components/PricingSection";

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const StarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollReveal />

      {/* ==================== HERO ==================== */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <div className="hero-bg-circle hero-bg-circle-1" />
          <div className="hero-bg-circle hero-bg-circle-2" />
        </div>

        <div className="container hero-content">
          <div className="hero-badge hero-enter hero-enter-d1" id="hero-badge">
            <span className="hero-badge-dot" />
            Coming Soon to the Shopify App Store
          </div>

          <h1 className="hero-title hero-enter hero-enter-d2">
            Sell Smarter with <span>AI&#8209;Powered</span> Commerce
          </h1>

          <p className="hero-description hero-enter hero-enter-d3">
            BuyEase helps Shopify merchants boost revenue with intelligent
            product recommendations, one&#8209;click upsells, and real&#8209;time
            analytics — all on autopilot.
          </p>

          <div className="hero-cta-group hero-enter hero-enter-d4">
            <a href="#cta" className="btn btn-primary" id="hero-cta-primary">
              Get Early Access
            </a>
            <a href="#features" className="btn btn-secondary" id="hero-cta-secondary">
              See Features
            </a>
          </div>

          <div className="hero-stats hero-enter hero-enter-d5">
            <div>
              <div className="hero-stat-value">32%</div>
              <div className="hero-stat-label">Avg. Revenue Lift</div>
            </div>
            <div>
              <div className="hero-stat-value">5,000+</div>
              <div className="hero-stat-label">Beta Merchants</div>
            </div>
            <div>
              <div className="hero-stat-value">2.4s</div>
              <div className="hero-stat-label">Setup Time</div>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="hero-mockup hero-enter hero-enter-d5">
            <div className="mockup-wrapper">
              <div className="mockup-toolbar">
                <span className="mockup-dot mockup-dot-r" />
                <span className="mockup-dot mockup-dot-y" />
                <span className="mockup-dot mockup-dot-g" />
                <span className="mockup-url">buyease.app/dashboard</span>
              </div>
              <div className="mockup-body">
                <div className="m-stat">
                  <div className="m-stat-icon teal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 3h-8l-2 4h12l-2-4z" /></svg>
                  </div>
                  <div className="m-stat-label">Total Orders</div>
                  <div className="m-stat-value">1,284</div>
                  <div className="m-stat-change">+12.5% this week</div>
                </div>
                <div className="m-stat">
                  <div className="m-stat-icon orange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  </div>
                  <div className="m-stat-label">Revenue</div>
                  <div className="m-stat-value">$48.2k</div>
                  <div className="m-stat-change">+23.1% this week</div>
                </div>
                <div className="m-stat">
                  <div className="m-stat-icon teal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                  </div>
                  <div className="m-stat-label">Conversion Rate</div>
                  <div className="m-stat-value">4.8%</div>
                  <div className="m-stat-change">+1.2% this week</div>
                </div>
                <div className="m-stat">
                  <div className="m-stat-icon orange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                  </div>
                  <div className="m-stat-label">Upsell Revenue</div>
                  <div className="m-stat-value">$12.6k</div>
                  <div className="m-stat-change">+34.7% this week</div>
                </div>

                <div className="m-chart">
                  <div className="m-chart-title">Weekly Sales</div>
                  <div className="m-chart-bars">
                    <div className="m-chart-bar" style={{ height: "45%" }} />
                    <div className="m-chart-bar" style={{ height: "62%" }} />
                    <div className="m-chart-bar" style={{ height: "38%" }} />
                    <div className="m-chart-bar" style={{ height: "75%" }} />
                    <div className="m-chart-bar" style={{ height: "55%" }} />
                    <div className="m-chart-bar" style={{ height: "88%" }} />
                    <div className="m-chart-bar" style={{ height: "70%" }} />
                    <div className="m-chart-bar" style={{ height: "92%" }} />
                    <div className="m-chart-bar" style={{ height: "60%" }} />
                    <div className="m-chart-bar" style={{ height: "80%" }} />
                    <div className="m-chart-bar" style={{ height: "95%" }} />
                    <div className="m-chart-bar" style={{ height: "72%" }} />
                  </div>
                </div>

                <div className="m-orders">
                  <div className="m-orders-title">Recent Orders</div>
                  <div className="m-order-row">
                    <span className="m-order-id">#BE-1042</span>
                    <span className="m-order-amount">$124.99</span>
                    <span className="m-order-badge done">Fulfilled</span>
                  </div>
                  <div className="m-order-row">
                    <span className="m-order-id">#BE-1041</span>
                    <span className="m-order-amount">$89.50</span>
                    <span className="m-order-badge wait">Pending</span>
                  </div>
                  <div className="m-order-row">
                    <span className="m-order-id">#BE-1040</span>
                    <span className="m-order-amount">$256.00</span>
                    <span className="m-order-badge done">Fulfilled</span>
                  </div>
                  <div className="m-order-row">
                    <span className="m-order-id">#BE-1039</span>
                    <span className="m-order-amount">$67.25</span>
                    <span className="m-order-badge done">Fulfilled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="features" id="features">
        <div className="container">
          <div className="features-header reveal">
            <span className="section-label">Features</span>
            <h2 className="section-title">
              Everything You Need to <span>Scale Revenue</span>
            </h2>
            <p className="section-subtitle">
              A complete suite of tools designed specifically for Shopify
              merchants who want to sell more — without working more.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card reveal reveal-d1" id="feature-ai">
              <div className="feature-icon-wrap teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
              </div>
              <h3 className="feature-title">AI Product Recommendations</h3>
              <p className="feature-desc">
                Machine learning models analyze browsing behavior and purchase
                history to suggest exactly what each customer wants next.
              </p>
            </div>

            <div className="feature-card reveal reveal-d2" id="feature-upsell">
              <div className="feature-icon-wrap orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <h3 className="feature-title">One&#8209;Click Upsells</h3>
              <p className="feature-desc">
                Post&#8209;purchase and in&#8209;cart upsell offers that convert.
                Smart triggers show the right product at the right moment.
              </p>
            </div>

            <div className="feature-card reveal reveal-d3" id="feature-analytics">
              <div className="feature-icon-wrap teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
              </div>
              <h3 className="feature-title">Real&#8209;Time Analytics</h3>
              <p className="feature-desc">
                Granular dashboards tracking revenue impact, click&#8209;through
                rates, and conversion funnels — updated every second.
              </p>
            </div>

            <div className="feature-card reveal reveal-d4" id="feature-ab">
              <div className="feature-icon-wrap orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
              </div>
              <h3 className="feature-title">A/B Testing Engine</h3>
              <p className="feature-desc">
                Test product placements, copy variants, and pricing strategies.
                Let the data choose winners automatically.
              </p>
            </div>

            <div className="feature-card reveal reveal-d5" id="feature-bundles">
              <div className="feature-icon-wrap teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
              </div>
              <h3 className="feature-title">Smart Bundles</h3>
              <p className="feature-desc">
                Auto&#8209;generate product bundles based on frequently bought
                together patterns. Increase AOV effortlessly.
              </p>
            </div>

            <div className="feature-card reveal reveal-d6" id="feature-integration">
              <div className="feature-icon-wrap orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
              </div>
              <h3 className="feature-title">Seamless Integration</h3>
              <p className="feature-desc">
                Install in under 3 seconds. Zero code changes needed. Works
                flawlessly with every Shopify theme out of the box.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="how-it-works-header reveal">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">
              Live in <span>Three Simple Steps</span>
            </h2>
            <p className="section-subtitle">
              No developers required. No complicated setup. Just install,
              connect, and start selling smarter.
            </p>
          </div>

          <div className="steps-row">
            <div className="step-item reveal reveal-d1" id="step-1">
              <div className="step-number"><span>1</span></div>
              <h3 className="step-title">Install the App</h3>
              <p className="step-desc">
                One click from the Shopify App Store. BuyEase automatically
                syncs with your product catalog and store data.
              </p>
            </div>
            <div className="step-item reveal reveal-d2" id="step-2">
              <div className="step-number"><span>2</span></div>
              <h3 className="step-title">AI Does the Work</h3>
              <p className="step-desc">
                Our engine analyzes your traffic patterns and customer segments
                to build personalized strategies within minutes.
              </p>
            </div>
            <div className="step-item reveal reveal-d3" id="step-3">
              <div className="step-number"><span>3</span></div>
              <h3 className="step-title">Watch Revenue Grow</h3>
              <p className="step-desc">
                Sit back as intelligent upsells, bundles, and recommendations
                drive conversions on complete autopilot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <PricingSection />

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="testimonials-header reveal">
            <span className="section-label">Testimonials</span>
            <h2 className="section-title">
              Loved by <span>Merchants Worldwide</span>
            </h2>
            <p className="section-subtitle">
              Don&apos;t just take our word for it — hear what early beta
              merchants are saying.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card reveal reveal-d1" id="testimonial-1">
              <div className="testimonial-stars"><StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon /></div>
              <p className="testimonial-text">
                &ldquo;We saw a 28% lift in average order value within the first
                week. BuyEase&apos;s recommendations feel like magic — our
                customers love the personalized experience.&rdquo;
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar teal">SL</div>
                <div>
                  <div className="testimonial-name">Sarah Lin</div>
                  <div className="testimonial-role">Founder, Glow Botanics</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card reveal reveal-d2" id="testimonial-2">
              <div className="testimonial-stars"><StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon /></div>
              <p className="testimonial-text">
                &ldquo;Setup took literally seconds. No code, no theme edits,
                just pure results. Our upsell revenue went from $0 to $8k/month
                without lifting a finger.&rdquo;
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar orange">MK</div>
                <div>
                  <div className="testimonial-name">Marcus Kim</div>
                  <div className="testimonial-role">CEO, UrbanThread Co.</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card reveal reveal-d3" id="testimonial-3">
              <div className="testimonial-stars"><StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon /></div>
              <p className="testimonial-text">
                &ldquo;The A/B testing alone paid for a year of BuyEase. We
                discovered that a simple bundle re&#8209;order increased
                conversions by 41%.&rdquo;
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar teal">PR</div>
                <div>
                  <div className="testimonial-name">Priya Rao</div>
                  <div className="testimonial-role">Head of Ecom, FitNest</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="cta-section" id="cta">
        <div className="container">
          <div className="cta-box reveal">
            <div className="cta-content">
              <h2 className="cta-title">
                Ready to <span>Supercharge</span> Your Store?
              </h2>
              <p className="cta-desc">
                Join 5,000+ merchants on the waitlist. Be the first to launch
                with BuyEase when we go live on the Shopify App Store.
              </p>
              <WaitlistForm id="waitlist-form" />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-brand-name">
                <span className="footer-brand-icon"><CartIcon /></span>
                BuyEase
              </div>
              <p>
                AI&#8209;powered commerce tools helping Shopify merchants sell
                smarter, not harder. Built for independent brands.
              </p>
            </div>

            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#">Changelog</a>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>

            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 BuyEase. All rights reserved.</p>
            <div className="footer-socials">
              <a href="#" className="footer-social-link" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="footer-social-link" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="#" className="footer-social-link" aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
