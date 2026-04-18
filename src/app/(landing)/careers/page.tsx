import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Careers | BuyEase",
  description: "Join the BuyEase team to build the future of e-commerce enablement.",
};

const JOBS = [
  {
    title: "Senior Full Stack Engineer",
    type: "Full-Time",
    location: "Remote (Global)",
    team: "Engineering",
  },
  {
    title: "Product Marketing Manager",
    type: "Full-Time",
    location: "Remote (US/Canada)",
    team: "Growth",
  },
  {
    title: "Customer Success Specialist",
    type: "Full-Time",
    location: "Remote (Europe/UK)",
    team: "Support",
  },
];

export default function CareersPage() {
  return (
    <main className="flex flex-col min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Build the future of <span className="text-teal-600">e-commerce</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We are a fully remote team passionate about empowering merchants. Come help us build fast, beautiful, and highly-converting tools.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Why BuyEase?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-6 bg-muted/50 rounded-lg">
               <h3 className="font-bold mb-2">Remote-First</h3>
               <p className="text-sm text-muted-foreground">Work from anywhere. We value deep work and async communication.</p>
             </div>
             <div className="p-6 bg-muted/50 rounded-lg">
               <h3 className="font-bold mb-2">Competitive Pay</h3>
               <p className="text-sm text-muted-foreground">Top of market salary bands and meaningful equity packages.</p>
             </div>
             <div className="p-6 bg-muted/50 rounded-lg">
               <h3 className="font-bold mb-2">Ownership</h3>
               <p className="text-sm text-muted-foreground">No middle-management overhead. Ship fast and take pride in your impact.</p>
             </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-6">Open Positions</h2>
          <div className="space-y-4">
            {JOBS.map((job) => (
              <Card key={job.title} className="hover:border-teal-500/50 transition-colors">
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Badge variant="outline">{job.team}</Badge></span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white shrink-0">
                    Apply Now
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't see a role that fits? Shoot us an email at <a href="mailto:careers@buyease.app" className="text-teal-600 hover:underline">careers@buyease.app</a> with your resume.
          </p>
        </div>
      </div>
    </main>
  );
}