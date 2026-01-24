'use client'

import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { CRICKET_BATS } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
  className?: string;
}

export function ProductCarousel({ className }: ProductCarouselProps) {
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <section className={cn("w-full py-16 px-4 md:px-8 lg:px-20", className)}>
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl md:text-4xl lg:text-5xl font-bold mb-12">
          Our Products
        </h2>
        
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={() => plugin.current.stop()}
          onMouseLeave={() => plugin.current.reset()}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4">
            {CRICKET_BATS.slice(0, 5).map((product) => (
              <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex" />
          <CarouselNext className="hidden lg:flex" />
        </Carousel>
      </div>
    </section>
  );
}
