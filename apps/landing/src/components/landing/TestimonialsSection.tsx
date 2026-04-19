"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TESTIMONIALS = [
  { initials: "SL", name: "Sarah Lin", role: "Founder, Glow Botanics", text: "We saw a 28% lift in average order value within the first week. BuyEase’s recommendations feel like magic — our customers love the personalized experience.", color: "teal" },
  { initials: "MK", name: "Marcus Kim", role: "CEO, UrbanThread Co.", text: "Setup took literally seconds. No code, no theme edits, just pure results. Our upsell revenue went from $0 to $8k/month without lifting a finger.", color: "orange" },
  { initials: "PR", name: "Priya Rao", role: "Head of Ecom, FitNest", text: "The A/B testing alone paid for a year of BuyEase. We discovered that a simple bundle re-order increased conversions by 41%.", color: "teal" },
  { initials: "JD", name: "John Doe", role: "Owner, JD Sports", text: "I can't imagine running my store without it now. The integration was seamless, and the extra features are a game changer.", color: "orange" },
  { initials: "EM", name: "Emily Moore", role: "Marketing Director, BeautyBox", text: "This tool paid for itself on day one. Setting up the post-purchase upsells took practically zero effort and the ROI is massive.", color: "teal" },
  { initials: "DT", name: "David Thorne", role: "Co-Founder, TechGeeks", text: "Exceptional support and an incredibly intuitive interface. We saw a solid 15% increase in conversions immediately after launch.", color: "orange" },
  { initials: "AM", name: "Alicia Miller", role: "Ecom Manager, FreshFinds", text: "The data analytics are incredibly detailed without being overwhelming. Helped us tune our offers perfectly for our target audience.", color: "teal" },
  { initials: "RJ", name: "Robert Jones", role: "CEO, NextGen Retail", text: "We swapped out three other apps just to use BuyEase. It's lightning fast and the customized checkouts are simply brilliant.", color: "orange" },
  { initials: "CH", name: "Chris Harper", role: "Founder, Peak Performance", text: "Finally an app that understands what high-volume COD merchants actually need. Five stars for the SMS automations alone.", color: "teal" },
];

export default function TestimonialsSection() {
  const itemsPerRow = 3;
  const maxRows = Math.ceil(TESTIMONIALS.length / itemsPerRow);
  const [visibleRows, setVisibleRows] = useState(1);

  const visibleItems = TESTIMONIALS.slice(0, visibleRows * itemsPerRow);
  const hasMore = visibleRows < maxRows;

  const handleAction = () => {
    if (hasMore) {
      setVisibleRows((prev) => prev + 1);
    } else {
      setVisibleRows(1);
    }
  };

  return (
    <section className="py-24" id="testimonials">
      <div className="max-w-[1160px] mx-auto px-6">
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-bold tracking-widest uppercase text-teal-600 mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Loved by <span className="text-teal-600">Merchants Worldwide</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Don&apos;t just take our word for it — hear what early beta merchants are saying.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleItems.map((t, i) => (
            <Card
              key={t.name}
              className={`animate-float hover:shadow-lg transition-all duration-300 flex flex-col justify-between`}
              id={`testimonial-${i + 1}`}
              style={{ animationDelay: `${(i % 5) * 0.7}s` }}
            >
              <CardHeader className="pb-2">
                <div className="flex gap-0.5 text-orange-500">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="size-4 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </CardContent>
              <CardFooter className="pt-2 flex items-center gap-3">
                <div
                  className={`size-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    t.color === "teal"
                      ? "bg-teal-100 text-teal-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {t.initials}
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-bold leading-none">{t.name}</p>
                  <p className="text-xs text-muted-foreground leading-none">{t.role}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAction}
          >
            {hasMore ? "View More" : "Show Less"}
          </Button>
        </div>
      </div>
    </section>
  );
}
