import { Hero3 } from "@/components/hero3";
import { WikiCard } from "@/components/ui/wiki-card";
import { ProductCarousel } from "@/components/product-carousel";


export default function Home() {
  return (
    <>
      <Hero3 className="mx-20"/>
      <ProductCarousel />
    </>
  );
}
