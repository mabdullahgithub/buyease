"use client";

import { useState } from "react";
import {
  ArrowsLeftRight,
  StackPlus,
  ChatText,
  CursorClick,
  FileArrowDown,
  MapPin,
  MapTrifold,
  Ticket,
  ChartLineUp,
  Truck,
  ShieldSlash,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type FeatureItem = {
  title: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
    weight?: "regular" | "duotone" | "bold" | "fill" | "light" | "thin";
    style?: React.CSSProperties;
  }>;
  tone: "teal" | "orange";
};

const FEATURE_ITEMS: FeatureItem[] = [
  {
    title: "Upsells & Downsells",
    description:
      "Leverage 1-click upsells and downsells to boost conversions and average order value from cart to post-purchase by attracting customers with add-ons, and more.",
    icon: ArrowsLeftRight,
    tone: "teal",
  },
  {
    title: "In-Form Quantity Offers",
    description:
      "Drive sales with in-form quantity offers, encouraging bulk purchases and providing discounts directly in the order form, fostering repeat purchases and additional revenue.",
    icon: StackPlus,
    tone: "orange",
  },
  {
    title: "SMS Automation",
    description:
      "Deliver personalized messages for order confirmations, recover abandoned orders, send shipping updates, reduce Return to Origin instances, and verify customer phone numbers with SMS OTP for COD orders.",
    icon: ChatText,
    tone: "teal",
  },
  {
    title: "Event Tracking",
    description:
      "Configure your analytics tracking pixels to track your form purchases and events on Facebook, TikTok, Snapchat, Pinterest, Google Analytics, and more.",
    icon: CursorClick,
    tone: "orange",
  },
  {
    title: "Google Sheets",
    description:
      "Import your COD form orders automatically into Google Sheets for easy management and analysis.",
    icon: FileArrowDown,
    tone: "teal",
  },
  {
    title: "Google Autocomplete",
    description:
      "Simplify address input with Google Autocomplete, reducing errors and speeding up the checkout process.",
    icon: MapPin,
    tone: "orange",
  },
  {
    title: "Postal Code Limitation",
    description:
      "Exclude/allow a list of specific postal codes from making orders on the form, to control delivery areas.",
    icon: MapTrifold,
    tone: "teal",
  },
  {
    title: "Discounts and Abandoned Checkouts",
    description:
      "Offer custom discounts (fixed or percentage), countdown and recover abandoned checkouts with automatic SMS messages.",
    icon: Ticket,
    tone: "orange",
  },
  {
    title: "Data Analytics",
    description:
      "Provide insights into user behavior, engagement, and performance through tracking and analysis of various metrics, helping you optimize their app's functionality and user experience to drive growth.",
    icon: ChartLineUp,
    tone: "teal",
  },
  {
    title: "Conditional Shipping Rates",
    description:
      "Create more types of conditions for your shipping rates based on the product by cleverly using order total, product weights, and weight conditions on the app. Enable shipping rates for specific provinces/states where you want to.",
    icon: Truck,
    tone: "orange",
  },
  {
    title: "IP Blocking",
    description:
      "Block specific users from making orders on the form by entering their IP addresses.",
    icon: ShieldSlash,
    tone: "teal",
  },
];

const INITIAL_VISIBLE_COUNT = 6;

export default function FeaturesSection() {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded
    ? FEATURE_ITEMS
    : FEATURE_ITEMS.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <section className="py-24 bg-muted/50" id="features">
      <div className="max-w-[1160px] mx-auto px-6">
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-bold tracking-widest uppercase text-teal-600 mb-3">
            Key Features
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Everything You Need to <span className="text-teal-600">Scale Revenue</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Powerful COD-first capabilities to increase conversion, reduce friction,
            and maximize your order value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleItems.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className={`reveal reveal-d${(i % 6) + 1} hover:-translate-y-1 hover:shadow-md transition-all duration-300`}
                id={`feature-${i}`}
              >
                <CardContent className="p-7">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`w-11 h-11 shrink-0 rounded-md flex items-center justify-center ${
                        feature.tone === "teal"
                          ? "bg-teal-100 text-teal-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      <Icon
                        className="w-5 h-5 feature-icon-loop"
                        weight="duotone"
                        style={{ animationDelay: `${(i % 6) * 120}ms` } as React.CSSProperties}
                      />
                    </div>
                    <h3 className="text-base font-bold leading-tight">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "Show Less" : "Show More"}
          </Button>
        </div>
      </div>
    </section>
  );
}
