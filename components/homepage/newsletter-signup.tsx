"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brand } from "@/lib/brand";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Subscription failed");
      }

      setStatus("success");
      setMessage("Thanks for subscribing. We'll be in touch with new arrivals and project inspiration.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <section className="bg-inkjet py-14 text-white">
      <div className="site-shell grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="space-y-3">
          <p className="brand-eyebrow">Newsletter</p>
          <h2 className="font-heading text-4xl">Be the first to know</h2>
          <p className="max-w-xl text-white/80">
            Get the latest products, renovation inspiration and exclusive {brand.name} offers.
          </p>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email address"
              className="h-12 rounded-full border-white/20 bg-white/10 px-5 text-white placeholder:text-white/50"
              required
            />
            <Button
              type="submit"
              disabled={status === "loading"}
              className="gold-cta-on-dark h-12 rounded-full px-6 whitespace-nowrap"
            >
              {status === "loading" ? "Submitting..." : "Subscribe"}
            </Button>
          </div>
          {message ? (
            <p
              className={`text-sm ${status === "error" ? "text-red-200" : "text-white/80"}`}
            >
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
