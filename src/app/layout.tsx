import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/shell";
export const metadata: Metadata = {
  title: "ASTRA — Mission intelligence",
  description:
    "Follow a 180-day fictional mission with editable 15-minute telemetry, crew comparisons and transparent 30-day scenarios. Independent research prototype.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
