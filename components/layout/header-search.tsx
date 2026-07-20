"use client";

import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function searchPath(query: string) {
  const params = new URLSearchParams();
  params.set("q", query);
  return `/search?${params.toString()}`;
}

export function HeaderSearch({
  initialQuery = "",
  showDesktop = true,
  showMobile = true,
}: {
  initialQuery?: string;
  showDesktop?: boolean;
  showMobile?: boolean;
}) {
  const router = useRouter();
  const [mobileQuery, setMobileQuery] = useState(initialQuery);

  function handleMobileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!mobileQuery.trim()) {
      return;
    }

    router.push(searchPath(mobileQuery.trim()));
  }

  return (
    <>
      {showDesktop ? (
        <form action="/search" className="hidden w-full max-w-xl md:block">
          <label htmlFor="site-search" className="sr-only">
            Search for products
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="site-search"
              name="q"
              defaultValue={initialQuery}
              placeholder="Search for products..."
              className="h-12 rounded-full border-gray-300 bg-white pl-11 pr-4"
            />
          </div>
        </form>
      ) : null}

      {showMobile ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open search"
            >
              <Search className="size-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle>Search the catalog</DialogTitle>
              <DialogDescription>
                Find premium products across bathroom, doors & hardware, and kitchen & laundry.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleMobileSubmit}>
              <label htmlFor="mobile-search" className="sr-only">
                Search for products
              </label>
              <Input
                id="mobile-search"
                value={mobileQuery}
                onChange={(event) => setMobileQuery(event.target.value)}
                placeholder="Search for products..."
                className="h-12 rounded-full border-gray-300 px-5"
              />
              <Button type="submit" className="gold-cta w-full rounded-full">
                Search
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
