"use client";

import {
  IconHome,
  IconPackage,
  IconCategory,
  IconSettings,
  IconInnerShadowTop,
  IconShoppingCart,
  IconUsers,
  IconReceiptRefund,
} from "@tabler/icons-react";
import { useUser } from "@stackframe/stack";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import logo from "../../public/logo2.png";
import Image from "next/image";

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const user = useUser();

  const adminNav = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconHome,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: IconShoppingCart,
    },
    {
      title: "Refunds",
      url: "/admin/refunds",
      icon: IconReceiptRefund,
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: IconPackage,
    },
    {
      title: "Add Product",
      url: "/admin/products/new",
      icon: IconPackage,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: IconCategory,
    },
    {
      title: "Add Category",
      url: "/admin/categories/new",
      icon: IconCategory,
    },
  ];

  const secondaryNav = [
    {
      title: "View Store",
      url: "/",
      icon: IconHome,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button] h-14"
            >
              <a href="/admin">
                <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden">
                  <Image src={logo} alt="Doaba Sports" fill />
                </div>
                <span className="text-base font-semibold">Doaba Sports</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminNav} />
        <NavSecondary items={secondaryNav} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.displayName || "Admin User",
              email: user.primaryEmail || "",
              avatar: user.profileImageUrl || "/avatars/shadcn.jpg",
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
