import { UserButton } from "@stackframe/stack";
import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { stackServerApp } from "@/stack/server";
import { CartIcon } from "@/components/cart-icon";

export default async function NavBar() {
  const user = await stackServerApp.getUser();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/products", label: "Products" },
    { href: "/categories", label: "Categories" },
    { href: "/orders", label: "My Orders" },
  ];

  return (
    <nav className="w-full border-b bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-bold text-xl tracking-tight text-gray-900 whitespace-nowrap"
          >
            Doaba Sports
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 ml-15 text-md">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-gray-700 font-medium transition-colors hover:text-gray-900 group whitespace-nowrap"
              >
                {link.label}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0 group-hover:right-auto origin-right group-hover:origin-left"></span>
              </Link>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="What are you looking for?"
            className="w-full pl-10 pr-4 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
          />
        </div>

        {/* Cart Icon */}
        <CartIcon />

        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-2">
            {user ? (
              <NavigationMenuItem>
                <UserButton />
              </NavigationMenuItem>
            ) : (
              <>
                <NavigationMenuItem>
                  <Button asChild variant="outline">
                    <Link href="/handler/sign-in">Sign In</Link>
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button asChild>
                    <Link href="/handler/sign-up">Sign Up</Link>
                  </Button>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}
