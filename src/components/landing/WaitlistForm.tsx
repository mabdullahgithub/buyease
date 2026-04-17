"use client";

import { useState } from "react";
import { Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WaitlistForm({ id }: { id: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        id={id}
        className="glass-surface flex items-center gap-2 px-4 py-2 rounded-md border border-teal-200/60 text-teal-700 dark:text-teal-300 font-semibold text-xs shadow-none"
      >
        <Check className="w-4 h-4" weight="bold" />
        You&apos;re on the list! We&apos;ll be in touch soon.
      </div>
    );
  }

  return (
    <form id={id} onSubmit={handleSubmit} className="flex w-full max-w-md flex-wrap items-center justify-center gap-2">
      <Input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 min-w-[220px] h-8 text-xs"
      />
      <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
        Join Waitlist
      </Button>
    </form>
  );
}
