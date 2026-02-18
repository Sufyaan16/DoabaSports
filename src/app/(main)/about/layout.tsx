import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Doaba Sports — your trusted partner for premium cricket equipment and accessories since 1995. Quality craftsmanship and dedicated customer support.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
