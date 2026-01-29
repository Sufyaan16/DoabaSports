import { CartProvider } from "@/contexts/cart-context";
import { ConditionalLayout } from "@/components/conditional-layout";
import NavBar from "@/components/nav/nav-bar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <ConditionalLayout navbar={<NavBar />}>
        {children}
      </ConditionalLayout>
    </CartProvider>
  );
}
