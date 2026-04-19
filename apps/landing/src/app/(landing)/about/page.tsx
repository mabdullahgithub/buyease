import Link from "next/link";

export const metadata = {
  title: "About Us | BuyEase",
  description: "Learn more about the team behind BuyEase and our mission to help independent merchants succeed.",
};

export default function AboutPage() {
  return (
    <main className="flex flex-col min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto w-full">
        <p className="text-xs font-bold tracking-widest uppercase text-teal-600 mb-3">Our Story</p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
          Empowering merchants to <span className="text-teal-600">maximize every sale</span>.
        </h1>
        
        <div className="prose prose-lg dark:prose-invert text-muted-foreground w-full max-w-none">
          <p className="mb-6 leading-relaxed">
            At BuyEase, we believe that the post-purchase experience is the most untapped opportunity in e-commerce. 
            We founded the company after struggling to find a clean, native-feeling upsell solution for our own Shopify stores that didn't drag down page load speeds or require a developer to implement.
          </p>
          <p className="mb-6 leading-relaxed">
            Our mission is simple: to help independent merchants increase their average order value (AOV) and build stronger customer relationships through seamless, data-driven offers.
          </p>
          <p className="mb-12 leading-relaxed">
            Today, BuyEase is built by a passionate, remote-first team of e-commerce veterans and software engineers. We're constantly iterating, testing, and listening to merchant feedback to build the ultimate checkout extension.
          </p>
        </div>

        <div className="flex gap-4 border-t pt-8 border-border">
          <Link href="/contact" className="bg-teal-600 hover:bg-teal-700 text-white group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 h-8 px-3">
            Get in Touch
          </Link>
          <Link href="/careers" className="border-border bg-background hover:bg-muted hover:text-foreground group/button inline-flex shrink-0 items-center justify-center rounded-lg border text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 h-8 px-3">
            Join the Team
          </Link>
        </div>
      </div>
    </main>
  );
}