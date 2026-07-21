import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsProvider } from "@/lib/analytics/provider";
import { fontSans } from "@/lib/fonts";
import { buildDefaultMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildDefaultMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-AU"
      className={`${fontSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-base text-tangaroa antialiased">
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
