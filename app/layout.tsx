import type { Metadata } from "next";
import { Lato, Montserrat } from "next/font/google";
import "./globals.css";

const bodyFont = Lato({ subsets: ["latin"], weight: ["300", "400", "700", "900"], variable: "--font-body" });
const headingFont = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-heading" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lion’s Route Shuttles SA | Premium • Private • Bespoke",
    template: "%s | Lion’s Route Shuttles SA",
  },
  description:
    "Your premium travel partner in South Africa. Airport transfers, day tours, long-distance travel and executive event transport.",
  icons: { icon: "/images/lions-route-logo.jpg" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: "Lion’s Route Shuttles SA",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>{children}</body>
    </html>
  );
}
