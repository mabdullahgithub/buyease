import type { Metadata } from "next";
import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import Navbar from "@/components/landing/Navbar";
import SiteFooter from "@/components/landing/SiteFooter";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy Policy | BuyEase",
  description: "Privacy Policy for BuyEase applications and services.",
};

const APP_NAME = "BuyEase";
const CONTACT_EMAIL = "privacy@buyease.app";

type SectionProps = {
  id?: string;
  title: string;
  children: React.ReactNode;
};

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
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
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last Updated: June 10, 2025</p>
          <p className="text-sm leading-6 text-muted-foreground">
            This Privacy Policy explains the information collection, use, and sharing
            practices of {APP_NAME} ("we," "us," and "our").
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Unless otherwise stated, this Policy describes and governs the information
            collection, use, and sharing practices with respect to your use of
            our website and related apps ("Apps"). By using the Apps, you
            understand that your information will be collected, used, and disclosed as
            outlined in this Policy. If you do not agree, please do not use the Apps.
          </p>
        </header>

        <article className="space-y-8">
          <Section title="Our Principles">
            <ul className="list-disc space-y-1 pl-5">
              <li>Privacy policies should be human-readable and easy to find.</li>
              <li>
                Data collection, storage, and processing should be simplified to
                enhance security, consistency, and user understanding.
              </li>
              <li>Data practices should meet reasonable user expectations.</li>
            </ul>
          </Section>

          <Section title="Information We Collect">
            <p>
              We collect information in multiple ways, including when you provide
              information directly, when information is automatically collected from
              browser/device usage, and when information is obtained from third parties.
            </p>
            <h3 className="text-sm font-medium text-foreground">Information You Provide Directly to Us</h3>
            <p>
              We may collect information when you install the app, contact support,
              enter a newsletter flow, or download any app. This may include name,
              email address, phone number, mailing address, payment information, and
              geographic location.
            </p>
            <h3 className="text-sm font-medium text-foreground">Information Automatically Collected</h3>
            <p>
              We may automatically collect information about the devices used to access
              Apps, including IP address, location by country/city, browser, operating
              system, device identifiers, mobile carrier, referring/exit URLs, pages
              viewed, order of pages, click data, time spent, usage frequency, and
              error logs.
            </p>
          </Section>

          <Section id="cookies" title="Cookies and Other Tracking Technologies">
            <p>
              We collect data through server logs and online tracking technologies,
              including cookies and tracking pixels. Cookies can help recognize your
              device, remember settings, understand visited pages and referrals,
              improve experience, perform analytics, and assist with security and
              administration.
            </p>
            <p>
              Tracking pixels (web beacons/clear GIFs) may measure ad impressions,
              clicks, communication effectiveness, and interactions with website
              elements. As additional technologies are adopted, additional information
              may be collected through those methods.
            </p>
            <p>
              You can configure your browser to notify you when cookies are set or to
              block cookies. Blocking cookies may reduce access to certain app features.
            </p>
          </Section>

          <Section title="Information from Third Parties">
            <p>
              To the extent permitted by law, we may collect information from public
              sources, social media platforms, and marketing/market research firms.
              Depending on the source, this may include contact data, demographic data,
              employer information, and information related to identity verification,
              fraud prevention, or safety.
            </p>
          </Section>

          <Section title="How We Use Your Information">
            <ul className="list-disc space-y-1 pl-5">
              <li>Fulfill the purposes for which information was provided.</li>
              <li>
                Provide and improve the Apps, including features, security, and
                customer support.
              </li>
              <li>
                Send account/service communications and subscribed newsletters.
              </li>
              <li>Process inquiries and request feedback.</li>
              <li>Conduct analytics, research, and reporting.</li>
              <li>Comply with legal obligations and protect safety and rights.</li>
              <li>Enforce Terms of Use and investigate potential violations.</li>
            </ul>
            <p>
              We may combine data collected from and about you with information from
              affiliates and non-affiliated third parties, and use combined information
              according to this Privacy Policy. We may also aggregate or de-identify
              information for research, marketing, and other lawful purposes.
            </p>
          </Section>

          <Section title="When We Disclose Your Information">
            <h3 className="text-sm font-medium text-foreground">Service Providers</h3>
            <p>
              We may share information with vendors providing services such as event
              management, marketing, customer support, storage, analysis/processing,
              and legal support.
            </p>
            <h3 className="text-sm font-medium text-foreground">Legal Compliance and Protection</h3>
            <p>
              We may disclose information when required by law or when reasonably
              necessary to comply with legal process, enforce terms/policies, respond
              to service requests, and protect rights, property, and safety.
            </p>
            <h3 className="text-sm font-medium text-foreground">Business Transfers</h3>
            <p>
              Information may be disclosed in mergers, acquisitions, financing, due
              diligence, sale of assets, or similar transactions.
            </p>
            <h3 className="text-sm font-medium text-foreground">Affiliates, Consent, and De-identified Data</h3>
            <p>
              Information may be shared with affiliated companies, with third parties
              when you consent, and as aggregated/de-identified data for lawful use.
            </p>
          </Section>

          <Section title="Legal Basis for Processing Personal Data">
            <ul className="list-disc space-y-1 pl-5">
              <li>To perform contractual commitments to users.</li>
              <li>
                Legitimate interests such as customer service, analytics, account
                management, security, legal management, and business improvement.
              </li>
              <li>Legal compliance obligations.</li>
              <li>Consent, where required or otherwise legally permitted.</li>
            </ul>
          </Section>

          <Section title="Online Analytics">
            <p>
              We may use third-party analytics providers (such as Google Analytics) to
              collect and analyze usage information, including IP address and referral
              source information. You may install the official Google Analytics Opt-out
              Browser Add-on to limit Google Analytics processing.
            </p>
          </Section>

          <Section title="Your Choices and Data Subject Rights">
            <p>
              Individuals in the EEA and other jurisdictions may have rights to access,
              correct, delete, object to processing, restrict processing, and withdraw
              consent (subject to legal exceptions/limitations).
            </p>
            <p>
              To exercise rights, contact: <a className="text-teal-600 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </Section>

          <Section title="International Transfers">
            <p>
              Information may be transferred, stored, and processed outside your country
              of residence, including in countries with different legal protections.
              Appropriate safeguards are used where required by applicable law.
            </p>
          </Section>

          <Section title="Security Measures">
            <p>
              We implement technical, physical, and organizational safeguards against
              unauthorized access, misuse, alteration, and loss of information.
              However, no internet transmission or electronic storage is fully secure.
            </p>
          </Section>

          <Section title="Data Retention">
            <p>
              Information is retained as long as necessary for the purposes in this
              Policy, or as required/permitted by law. Backup/business continuity copies
              may persist for additional time.
            </p>
          </Section>

          <Section title="Third-Party Links and Services">
            <p>
              Apps may include links and plugins to third-party websites/services.
              {APP_NAME} is not responsible for their privacy practices. Review each
              third party policy before use.
            </p>
          </Section>

          <Section title="Information Collected Through the App">
            <p>
              The app may collect recipient name, address, and phone number for COD form
              generation and attachment to packages.
            </p>
            <p>
              This information is used only to generate and attach COD forms and is not
              stored by {APP_NAME} in this specific workflow.
            </p>
          </Section>

          <Section title="Disclosure, Responsibility, and Limitation of Liability">
            <p>
              Because COD forms are used in delivery operations, data on the form may be
              visible to delivery personnel, recipients, and related parties.
            </p>
            <p>
              By using the app, you acknowledge this exposure in the delivery process.
              {APP_NAME} is not responsible for misuse by third parties once information
              is present on physical COD forms.
            </p>
          </Section>

          <Section title="Changes to this Privacy Policy">
            <p>
              This Policy may be updated to reflect service, legal, or operational
              changes. Updated versions will be posted with a revised "Last Updated"
              date.
            </p>
          </Section>

          <Section title="Questions About this Privacy Policy">
            <p>
              Contact: <a className="text-teal-600 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </Section>

          <Section title="BuyEase App Privacy Policy">
            <p>
              {APP_NAME} ("the App") provides software services to merchants using
              Shopify.
            </p>
            <h3 className="text-sm font-medium text-foreground">Personal Information the App Collects</h3>
            <p>
              On install, the app may access data from Shopify including shop email,
              store language, orders, products, and translations.
            </p>
            <p>
              Additional data may include user profile and billing contact information,
              collected directly from the individual and via Shopify.
            </p>
            <h3 className="text-sm font-medium text-foreground">How Personal Information Is Used</h3>
            <p>
              Data is used to provide and operate the service, communicate with users,
              optimize app performance, and provide information about products/services.
              Personal data is not sold or shared unless required by law.
            </p>
            <h3 className="text-sm font-medium text-foreground">Customer Data and Processing Roles</h3>
            <p>
              Customer Data is processed solely to provide service functionality. The
              merchant is generally responsible as controller/business for legal basis
              and lawful processing configuration. {APP_NAME} acts as processor/service
              provider under applicable laws.
            </p>
            <p>
              Customer Data is not sold or shared except as legally required. If SMS
              options are enabled, data may be shared with SMS providers solely to
              deliver the service.
            </p>
            <h3 className="text-sm font-medium text-foreground">Rights, Transfers, and Retention</h3>
            <p>
              European residents may request access, correction, updates, or deletion.
              Data may be processed outside Europe, including in Canada and the United
              States, with safeguards as required by law.
            </p>
            <p>
              Personal information is stored while service is active. After uninstall,
              personal information is deleted from databases after 48 hours. Other app
              activity data may be stored securely for up to 30 days.
            </p>
            <h3 className="text-sm font-medium text-foreground">Google Sheets Integration</h3>
            <p>
              If enabled, the app may request Google Drive (read-only) and Google
              Sheets (read/write) access to let users choose import files and
              synchronize orders. Stored data may include file ID and sheet name, used
              solely to provide service functionality.
            </p>
            <h3 className="text-sm font-medium text-foreground">Contact</h3>
            <p>
              For privacy questions or complaints, contact through the app contact page
              or <a className="text-teal-600 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </Section>
        </article>

        </div>
      </main>

      <SiteFooter />
    </>
  );
}
