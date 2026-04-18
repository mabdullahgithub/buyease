import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata = {
  title: "Blog | BuyEase",
  description: "Insightful articles on e-commerce growth, AOV optimization, and product updates.",
};

const POSTS = [
  {
    title: "5 Proven Post-Purchase Upsell Strategies for Q4",
    description: "Maximize your holiday revenue without paying more for ads.",
    date: "October 12, 2025",
    category: "Strategy",
  },
  {
    title: "Why A/B Testing Your Offers is Non-Negotiable",
    description: "Learn how a simple tweak in offer copy increased conversion by 18%.",
    date: "September 28, 2025",
    category: "Optimization",
  },
  {
    title: "Introducing Smart Product Bundling 2.0",
    description: "Our core bundling engine just got a massive performance overhaul.",
    date: "September 15, 2025",
    category: "Product Update",
  },
];

export default function BlogPage() {
  return (
    <main className="flex flex-col min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          The <span className="text-teal-600">BuyEase</span> Blog
        </h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
          Actionable strategies, product updates, and e-commerce insights directly from our growth team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.map((post, i) => (
            <Card key={i} className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer">
              <CardHeader>
                <div className="mb-3">
                  <Badge variant="secondary" className="text-orange-600 bg-orange-50 dark:bg-orange-950/30">
                    {post.category}
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-tight hover:text-teal-600 transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription className="pt-2">{post.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4 text-xs text-muted-foreground border-t border-border">
                {post.date}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}