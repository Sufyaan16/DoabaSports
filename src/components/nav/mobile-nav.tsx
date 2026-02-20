"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GlobalSearchBar } from "@/components/global-search-bar";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/orders", label: "My Orders" },
];

interface MobileNavProps {
  isAuthenticated: boolean;
}

export function MobileNav({ isAuthenticated }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Search Toggle - visible below md */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setShowSearch(!showSearch)}
        aria-label="Toggle search"
      >
        {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
      </Button>

      {/* Hamburger Menu - visible below lg */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="text-left font-bold text-lg">
              Doaba Sports
            </SheetTitle>
          </SheetHeader>

          {/* Mobile Search */}
          <div className="px-4 py-3 border-b">
            <GlobalSearchBar />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-6 py-3 text-sm font-medium transition-colors hover:bg-muted",
                  pathname === link.href
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Links for non-authenticated users */}
          {!isAuthenticated && (
            <div className="border-t px-4 py-4 space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/handler/sign-in" onClick={() => setOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/handler/sign-up" onClick={() => setOpen(false)}>
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Expandable search bar for mobile (below md) */}
      {showSearch && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b px-4 py-3 z-40">
          <GlobalSearchBar />
        </div>
      )}
    </>
  );
}
