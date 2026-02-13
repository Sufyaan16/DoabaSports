import { StackProvider, StackTheme } from "@stackframe/stack";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { stackClientApp } from "../stack/client";
import { Toaster } from "@/components/ui/sonner";
// @ts-ignore
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doabasports.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Doaba Sports — Premium Cricket Equipment & Accessories",
    template: "%s | Doaba Sports",
  },
  description:
    "Shop premium cricket bats, equipment, accessories, and apparel at Doaba Sports. Trusted quality since day one.",
  keywords: [
    "cricket bats",
    "cricket equipment",
    "sports accessories",
    "cricket gear",
    "Doaba Sports",
    "tapeball bats",
    "cricket apparel",
  ],
  authors: [{ name: "Doaba Sports" }],
  creator: "Doaba Sports",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Doaba Sports",
    title: "Doaba Sports — Premium Cricket Equipment & Accessories",
    description:
      "Shop premium cricket bats, equipment, accessories, and apparel at Doaba Sports.",
    images: [
      {
        url: "/cricket-equipments-green-grass.jpg",
        width: 1200,
        height: 630,
        alt: "Doaba Sports Cricket Equipment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Doaba Sports — Premium Cricket Equipment",
    description:
      "Shop premium cricket bats, equipment, accessories, and apparel.",
    images: ["/cricket-equipments-green-grass.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StackProvider app={stackClientApp}>
          <StackTheme>{children}</StackTheme>
        </StackProvider>
        <Toaster />
      </body>
    </html>
  );
}
