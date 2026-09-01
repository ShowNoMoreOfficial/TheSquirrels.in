import type { Metadata } from "next";
import { Playfair_Display, Lora, Libre_Franklin } from "next/font/google";
import "./globals.css";
import { Masthead } from "@/components/layout/Masthead";
import { SectionNav } from "@/components/layout/SectionNav";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL } from "@/lib/site";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const libreFranklin = Libre_Franklin({
  variable: "--font-franklin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Squirrels — Governance, Policy & Politics from India",
    template: "%s — The Squirrels",
  },
  description:
    "The Squirrels is an Indian news and analysis publication covering governance, policy, corporate affairs, politics and the economy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${lora.variable} ${libreFranklin.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <Masthead />
        <SectionNav />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
