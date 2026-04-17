import type { Metadata } from "next";
import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import Navbar from "@/components/landing/Navbar";
import SiteFooter from "@/components/landing/SiteFooter";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cookie Policy | BuyEase",
  description: "Cookie Policy for BuyEase applications and services.",
};

const APP_NAME = "BuyEase";
const CONTACT_EMAIL = "privacy@buyease.app";

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}

export default function CookiePolicyPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-24 text-foreground">
        <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-20">
          <div className="sticky top-4 z-30 mb-6 flex justify-start">
            <Link
              href="/"
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "inline-flex items-center gap-1.5 shadow-sm"
              )}
            >
              <CaretLeft className="size-3.5" />
              Back to Home
            </Link>
          </div>

          <header className="mb-10 space-y-3 border-b border-border pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">
              Legal
            </p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Cookie Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: June 10, 2025</p>
            <p className="text-sm leading-6 text-muted-foreground">
              This Cookie Policy explains how {APP_NAME} uses cookies and similar
              technologies when you visit or use our website and applications.
            </p>
          </header>

          <article className="space-y-8">
            <Section title="1. What Are Cookies?">
              <p>
                Cookies are small text files stored on your device when you visit a
                website. They help websites remember your actions and preferences and
                enable core functionality.
              </p>
            </Section>

            <Section title="2. Types of Cookies We Use">
              <ul className="list-disc space-y-1 pl-5">
                <li>Required cookies: needed for security, login, and core operation.</li>
                <li>Preference cookies: remember settings such as theme and UI choices.</li>
                <li>Analytics cookies: help us understand product usage and performance.</li>
                <li>Performance cookies: support diagnostics and service reliability.</li>
              </ul>
            </Section>

            <Section title="3. Why We Use Cookies">
              <ul className="list-disc space-y-1 pl-5">
                <li>Provide and secure the Services.</li>
                <li>Remember your settings and improve your experience.</li>
                <li>Measure performance and identify issues.</li>
                <li>Understand feature adoption and usage patterns.</li>
              </ul>
            </Section>

            <Section title="4. Similar Technologies">
              <p>
                We may use pixels, local storage, and server logs for similar purposes,
                such as session management, analytics, and measuring interactions.
              </p>
            </Section>

            <Section title="5. Managing Cookies">
              <p>
                Most browsers allow you to block or delete cookies. You can also adjust
                cookie preferences through available consent controls in the app. If you
                disable required cookies, parts of the Services may not function properly.
              </p>
            </Section>

            <Section title="6. Third-Party Cookies">
              <p>
                Some integrations (for example analytics providers) may set their own
                cookies subject to their privacy and cookie policies.
              </p>
            </Section>

            <Section title="7. Data Retention">
              <p>
                Cookie lifetimes vary by purpose. Session cookies are deleted when your
                browser closes, while persistent cookies may remain for a defined period
                unless deleted earlier.
              </p>
            </Section>

            <Section title="8. Changes to This Cookie Policy">
              <p>
                We may update this Cookie Policy from time to time. The "Last Updated"
                date above will reflect the effective version.
              </p>
            </Section>

            <Section title="9. Contact">
              <p>
                If you have questions about this Cookie Policy, contact us at
                <a className="text-teal-600 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </Section>
          </article>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
