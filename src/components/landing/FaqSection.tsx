"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is Cash on Delivery?",
    answer: "Cash on Delivery (COD) is a payment method where payment is made on delivery rather than in advance. If the goods are not paid for, they are returned to the retailer. In the context of online shopping, for example, customers pay for their items when they are delivered to their doorstep⁠.",
  },
  {
    question: "How can I hide or show Cash on Delivery for specific customers or products?",
    answer: "Yes, you can configure your settings to allow or exclude Cash On Delivery (COD) for specific products or collections on Shopify. You need to go to the Settings & Integrations page, and in the visibility section, modify the options in \"Limit your order form for only specific products, collections, countries, or order totals\"⁠.",
  },
  {
    question: "How does the Cash on Delivery form work?",
    answer: "If you need to limit Cash on Delivery to only some products or collections you have to use a separate order form for your Cash on Delivery orders. With Releasit, you can create a separate order form for your store where your customers will only be able to place orders with Cash on Delivery, and you can limit the order form to only the products and collections. The app allows you to create a fully customizable COD order form with native Upsells, Quantity Offers, Downsells, and OTP phone number verification.",
  },
  {
    question: "How can I add Cash on Delivery to invoice and emails?",
    answer: "You can add Cash On Delivery information to invoices and emails by customizing your store's settings and notifications. This often involves editing the default content and templates provided by your platform, like Shopify. However, the exact steps can vary depending on the specific platform and settings you are using⁠.",
  },
  {
    question: "Can Shopify redirect for shipping payment after choosing Cash on Delivery?",
    answer: "Yes, it is possible to redirect customers for additional payments after they have chosen Cash On Delivery (COD) on Shopify. This can be done by adding a button inside the form that redirects customers to the normal checkout for additional payments. However, this feature is primarily used for prepaid payments and is subject to Shopify's Terms of Service⁠.",
  },
  {
    question: "Can I cancel Cash on Delivery fake orders?",
    answer: "Yes, you can block specific users from making Cash On Delivery orders using their IP address. This is useful when you want to block customers who didn't pay for their order at delivery or fake customers or to allow only one order per day per customer⁠.",
  }
];

export default function FaqSection() {
  return (
    <section className="py-24 border-y border-border/50" id="faq">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-bold tracking-widest uppercase text-teal-600 mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Frequently Asked <span className="text-teal-600">Questions</span>
          </h2>
        </div>

        <Accordion className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className={cn(
                "border border-border/60 rounded-xl bg-background/50 hover:bg-background/80 transition-colors reveal overflow-hidden data-[state=open]:border-teal-500/50 data-[state=open]:bg-background/80 data-[state=open]:shadow-sm"
              )}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <AccordionTrigger className="px-5 py-5 text-left font-bold hover:no-underline [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg]:text-teal-600">
                <span>{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 text-muted-foreground leading-relaxed text-sm">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}