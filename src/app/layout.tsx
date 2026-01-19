import { StackProvider, StackTheme } from "@stackframe/stack";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { stackClientApp } from "../stack/client";
import "./globals.css";
import {
  CONTACT_LINKS,
  EcommerceFooter1,
  FOOTER_LINKS,
  NEWSLETTER_DATA,
} from "@/components/ecommerce-footer1";
import NavBar from "@/components/nav/nav-bar";

// import {
//   Sidebar,
//   SidebarProvider,
//   SidebarTrigger,
//   SidebarContent,
//   SidebarFooter,
// } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doaba Sports",
  description: "Learn how to build and scale Next.js apps with Brian Holt",
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
          <StackTheme>
            <NavBar />
            {children}
            <EcommerceFooter1
              newsletter={NEWSLETTER_DATA}
              footerLinks={FOOTER_LINKS}
              contactLinks={CONTACT_LINKS}
            />
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
