import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Data Processing Addendum | BuyEase",
  description: "Data Processing Addendum for BuyEase applications and services.",
};

const APP_NAME = "BuyEase";
const WEBSITE_URL = "buyease.app/dpa";

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

export default function DpaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-900/30 dark:selection:text-teal-100">

      <main className="flex-1 w-full pt-32 pb-24 px-6 relative">
        <div className="max-w-[760px] mx-auto">
          {/* Back button */}
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-10 text-muted-foreground hover:text-foreground -ml-4"
            )}
          >
            <ChevronLeft strokeWidth="3" className="mr-1 h-3.5 w-3.5" />
            Back to Home
          </Link>

          <article>
            <header className="mb-12">
              <p className="text-xs font-bold tracking-widest uppercase text-teal-600 mb-3">
                Legal
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                Data Processing Addendum
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={new Date().toISOString().split("T")[0]}>
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span>&middot;</span>
                <span>Effective Immediately</span>
              </div>
            </header>

            <div className="space-y-10">
              <p className="text-sm leading-6 text-muted-foreground">
                This {APP_NAME} Data Processing Addendum ("Addendum") amends the {APP_NAME} Terms of Service (the "Agreement") by and between you ("Controller") and {APP_NAME} Inc. ("{APP_NAME}").
              </p>

              <Section title="1. Definitions">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>(a)</strong> "Data Protection Legislation" means European Directives 95/46/EC and 2002/58/EC, and any legislation and/or regulation implementing or made pursuant to them, or which amends or replaces any of them (including the General Data Protection Regulation, Regulation (EU) 2016/679);
                  </li>
                  <li>
                    <strong>(b)</strong> "Data Processor", "Data Subject", "Processor", "Processing", "Subprocessor", and "Supervisory Authority" shall be interpreted in accordance with applicable Data Protection Legislation;
                  </li>
                  <li>
                    <strong>(c)</strong> "Personal Data" as used in this Addendum means information relating to an identifiable or identified Data Subject who visits or engages in transactions through your store (a "Customer"), which {APP_NAME} Processes as a Data Processor in the course of providing you with the Services. Notwithstanding the foregoing sentence, Personal Data does not include information that {APP_NAME} processes in the context of services that it provides directly to a consumer;
                  </li>
                  <li>
                    <strong>(d)</strong> All other capitalized terms in this Addendum shall have the same definition as in the Agreement.
                  </li>
                </ul>
              </Section>

              <Section title="2. Data Protection">
                <p>
                  <strong>2.1.</strong> As part of providing the Service, Data Subject&apos;s Personal Data will be processed in the applicable regions (e.g., the United States and Canada). Such processing will be completed in compliance with relevant Data Protection Legislation.
                </p>
                <p>
                  <strong>2.2.</strong> When {APP_NAME} Processes Personal Data in the course of providing the Services, {APP_NAME} will:
                </p>
                <ul className="list-none pl-5 space-y-4">
                  <li>
                    <strong>2.2.1.</strong> Process the Personal Data as a Data Processor, only for the purpose of providing the Services in accordance with documented instructions from you (provided that such instructions are commensurate with the functionalities of the Services), and as may subsequently be agreed to by you. If {APP_NAME} is required by law to Process the Personal Data for any other purpose, {APP_NAME} will provide you with prior notice of this requirement, unless {APP_NAME} is prohibited by law from providing such notice;
                  </li>
                  <li>
                    <strong>2.2.2.</strong> notify you if, in {APP_NAME}&apos;s opinion, your instruction for the processing of Personal Data infringes applicable Data Protection Legislation;
                  </li>
                  <li>
                    <strong>2.2.3.</strong> notify you promptly, to the extent permitted by law, upon receiving an inquiry or complaint from a Data Subject or Supervisory Authority relating to {APP_NAME}&apos;s Processing of the Personal Data;
                  </li>
                  <li>
                    <strong>2.2.4.</strong> implement and maintain appropriate technical and organizational measures to protect the Personal Data against unauthorized or unlawful processing and against accidental loss, destruction, damage, theft, alteration or disclosure. These measures shall be appropriate to the harm which might result from any unauthorized or unlawful processing, accidental loss, destruction, damage or theft of Personal Data and appropriate to the nature of the Personal Data which is to be protected;
                  </li>
                  <li>
                    <strong>2.2.5.</strong> provide you, upon request, with up-to-date attestations, reports or extracts thereof where available from a source charged with auditing {APP_NAME}&apos;s data protection practices (e.g. external auditors, internal audit, data protection auditors), or suitable certifications, to enable you to assess compliance with the terms of this Addendum;
                  </li>
                  <li>
                    <strong>2.2.6.</strong> notify you promptly upon becoming aware of and confirming any accidental, unauthorized, or unlawful processing of, disclosure of, or access to the Personal Data;
                  </li>
                  <li>
                    <strong>2.2.7.</strong> ensure that its personnel who access the Personal Data are subject to confidentiality obligations that restrict their ability to disclose the Customer Personal Data; and
                  </li>
                  <li>
                    <strong>2.2.8.</strong> upon termination of the Agreement, {APP_NAME} will promptly initiate its purge process to delete or anonymize the Personal Data. If you request a copy of such Personal Data within 60 days of termination, {APP_NAME} will provide you with a copy of such Personal Data.
                  </li>
                </ul>
                <p>
                  <strong>2.3.</strong> In the course of providing the Services, you acknowledge and agree that {APP_NAME} may use Subprocessors to Process the Personal Data. {APP_NAME}&apos;s use of any specific Subprocessor to process the Personal Data must be in compliance with Data Protection Legislation and must be governed by a contract between {APP_NAME} and Subprocessor.
                </p>
              </Section>

              <Section title="3. Miscellaneous">
                <p>
                  <strong>3.1.</strong> In the event of any conflict or inconsistency between the provisions of the Agreement and this Addendum, the provisions of this Addendum shall prevail. For avoidance of doubt and to the extent allowed by applicable law, any and all liability under this Addendum, including limitations thereof, will be governed by the relevant provisions of the Agreement. You acknowledge and agree that {APP_NAME} may amend this Addendum from time to time by posting the relevant amended and restated Addendum on {APP_NAME}&apos;s website, available at {WEBSITE_URL} and such amendments to the Addendum are effective as of the date of posting. Your continued use of the Services after the amended Addendum is posted to {APP_NAME}&apos;s website constitutes your agreement to, and acceptance of, the amended Addendum. If you do not agree to any changes to the Addendum, do not continue to use the Service.
                </p>
                <p>
                  <strong>3.2.</strong> Save as specifically modified and amended in this Addendum, all of the terms, provisions and requirements contained in the Agreement shall remain in full force and effect and govern this Addendum. If any provision of the Addendum is held illegal or unenforceable in a judicial proceeding, such provision shall be severed and shall be inoperative, and the remainder of this Addendum shall remain operative and binding on the parties.
                </p>
                <p>
                  <strong>3.3.</strong> The terms of this Addendum shall be governed by and interpreted in accordance with the laws applicable to {APP_NAME}, without regard to principles of conflicts of laws. The parties irrevocably and unconditionally submit to the exclusive jurisdiction of the state or federal courts located in the jurisdiction of {APP_NAME} with respect to any dispute or claim arising out of or in connection with this Addendum.
                </p>
              </Section>
            </div>
          </article>
        </div>
      </main>

    </div>
  );
}