import type { Metadata, Viewport } from "next";
import { Onest, Instrument_Serif, Caveat } from "next/font/google";
import "./globals.css";

const onest = Onest({ subsets: ["latin"], variable: "--font-onest", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const hand = Caveat({ subsets: ["latin"], weight: "600", variable: "--font-hand", display: "swap" });

export const metadata: Metadata = {
  title: "Resumera — a résumé tailored to every job",
  description:
    "Paste a job posting. Resumera rewrites your résumé in the recruiter's words, shows your match score and exports an ATS-friendly PDF. Nothing invented.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${onest.variable} ${serif.variable} ${hand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
