import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms of Service | BuyEase",
  description: "Terms of Service for BuyEase applications and services.",
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

export default function TermsOfServicePage() {
  return (
    <>

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
              <ChevronLeft className="size-3.5" />
              Back to Home
            </Link>
          </div>

          <header className="mb-10 space-y-3 border-b border-border pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">
              Legal
            </p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last Updated: June 10, 2025</p>
            <p className="text-sm leading-6 text-muted-foreground">
              These Terms of Service ("Terms") govern your use of {APP_NAME} websites,
              apps, and related services (collectively, the "Services"). By accessing or
              using the Services, you agree to these Terms.
            </p>
          </header>

          <article className="space-y-8">
            <Section title="1. Eligibility and Account Use">
              <p>
                You must have the legal capacity to enter into binding agreements and use
                the Services in compliance with all applicable laws. You are responsible
                for safeguarding your account credentials and all activity under your
                account.
              </p>
            </Section>

            <Section title="2. Services and Changes">
              <p>
                We may modify, suspend, or discontinue all or part of the Services at any
                time, including features, pricing, integrations, and support scope.
                Reasonable updates may be made without prior notice where necessary.
              </p>
            </Section>

            <Section title="3. Acceptable Use">
              <ul className="list-disc space-y-1 pl-5">
                <li>No unlawful, fraudulent, or abusive activity.</li>
                <li>No interference with service integrity, security, or performance.</li>
                <li>No unauthorized access attempts or reverse engineering where prohibited.</li>
                <li>No misuse of customer data or third-party platform APIs.</li>
              </ul>
            </Section>

            <Section title="4. Merchant Responsibilities">
              <p>
                Merchants are responsible for configuration, legal disclosures, obtaining
                required customer consents, and ensuring compliance with local consumer,
                privacy, and ecommerce laws.
              </p>
            </Section>

            <Section title="5. Fees, Billing, and Taxes">
              <p>
                Paid features may require subscription or usage-based fees. You authorize
                applicable billing through the connected platform or payment provider.
                Unless stated otherwise, fees are non-refundable and exclusive of taxes.
              </p>
            </Section>

            <Section title="6. Intellectual Property">
              <p>
                The Services, including software, branding, and documentation, are owned
                by {APP_NAME} or its licensors and protected by intellectual property laws.
                You receive a limited, non-exclusive, revocable right to use the Services
                according to these Terms.
              </p>
            </Section>

            <Section title="7. Third-Party Services">
              <p>
                The Services may integrate with third-party tools and platforms (including
                Shopify and optional providers). Your use of third-party services is
                governed by their terms and policies.
              </p>
            </Section>

            <Section title="8. Data and Privacy">
              <p>
                Use of personal data is governed by our Privacy Policy and applicable data
                protection laws. You remain responsible for ensuring a lawful basis for
                data you collect and process through your store workflows.
              </p>
            </Section>

            <Section title="9. Disclaimer of Warranties">
              <p>
                The Services are provided on an "as is" and "as available" basis without
                warranties of any kind, whether express or implied, including
                merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </Section>

            <Section title="10. Limitation of Liability">
              <p>
                To the maximum extent permitted by law, {APP_NAME} will not be liable for
                indirect, incidental, special, consequential, or punitive damages, or any
                loss of profits, revenue, data, or goodwill arising from your use of the
                Services.
              </p>
            </Section>

            <Section title="11. Indemnification">
              <p>
                You agree to indemnify and hold harmless {APP_NAME} from claims, damages,
                liabilities, and expenses arising out of your misuse of the Services,
                violation of these Terms, or violation of law.
              </p>
            </Section>

            <Section title="12. Termination">
              <p>
                We may suspend or terminate access to the Services if you violate these
                Terms, create security risk, or where required by law. You may stop using
                the Services at any time by uninstalling or closing your account.
              </p>
            </Section>

            <Section title="13. Governing Law">
              <p>
                These Terms are governed by applicable laws of the jurisdiction in which
                the service operator is established, unless mandatory local law requires
                otherwise.
              </p>
            </Section>

            <Section title="14. Changes to These Terms">
              <p>
                We may update these Terms from time to time. Continued use of the
                Services after updates become effective constitutes acceptance of the
                revised Terms.
              </p>
            </Section>

            <Section title="15. Contact">
              <p>
                For questions about these Terms, contact us at
                <a className="text-teal-600 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </Section>
          </article>
        </div>
      </main>

    </>
  );
}
