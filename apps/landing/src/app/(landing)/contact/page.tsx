import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export const metadata = {
  title: "Contact Us | BuyEase",
  description: "Get in touch with the BuyEase team for support, sales, or general inquiries.",
};

export default function ContactPage() {
  return (
    <main className="flex flex-col min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            Have a question? We'd love to hear from you. Drop us a message below and we'll get back to you as soon as possible.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>Fill out the form below and our team will be in touch.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                  <Input id="firstName" placeholder="Jane" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                <Input id="email" type="email" placeholder="jane@example.com" />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                {/* Fallback to standard Tailwind styled textarea since we might not have a Textarea component installed */}
                <textarea 
                  id="message" 
                  rows={5}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="How can we help you?"
                />
              </div>

              <Button type="button" className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-12 flex flex-col md:flex-row justify-center gap-8 text-center text-sm">
          <div>
            <h3 className="font-bold text-foreground">Support</h3>
            <p className="text-muted-foreground">support@buyease.app</p>
          </div>
          <div>
            <h3 className="font-bold text-foreground">Partnerships</h3>
            <p className="text-muted-foreground">partners@buyease.app</p>
          </div>
        </div>
      </div>
    </main>
  );
}