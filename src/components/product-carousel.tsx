'use client'

import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Price, PriceValue } from "@/components/price";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProductPrice {
  regular: number;
  sale?: number;
  currency: string;
}

interface Product {
  name: string;
  image: {
    src: string;
    alt: string;
  };
  link: string;
  description: string;
  price: ProductPrice;
  badge?: {
    text: string;
    backgroundColor?: string;
  };
}

const PRODUCTS: Product[] = [
  {
    name: "Vexon CoreStep '08 LX",
    image: {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/clothes/joshua-diaz-ETNoDLl8yFE-unsplash-1.jpg",
      alt: "Vexon CoreStep '08 LX",
    },
    link: "#",
    description:
      "Everyday comfort meets bold tri-color style in this performance-driven design.",
    price: {
      regular: 499.0,
      sale: 399.0,
      currency: "USD",
    },
    badge: {
      text: "Selling fast!",
      backgroundColor: "oklch(50.5% 0.213 27.518)",
    },
  },
//   {
//     name: "Premium Cricket Bat",
//     image: {
//       src: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
//       alt: "Premium Cricket Bat",
//     },
//     link: "#",
//     description:
//       "Professional-grade English willow bat for serious players.",
//     price: {
//       regular: 299.0,
//       currency: "USD",
//     },
//     badge: {
//       text: "New Arrival",
//       backgroundColor: "oklch(60% 0.15 145)",
//     },
//   },
  {
    name: "Elite Cricket Gear Set",
    image: {
      src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
      alt: "Elite Cricket Gear Set",
    },
    link: "#",
    description:
      "Complete cricket equipment package for aspiring champions.",
    price: {
      regular: 599.0,
      sale: 499.0,
      currency: "USD",
    },
  },
  {
    name: "Kashmir Willow Special",
    image: {
      src: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=800&q=80",
      alt: "Kashmir Willow Special",
    },
    link: "#",
    description:
      "High-quality Kashmir willow bat with excellent balance and power.",
    price: {
      regular: 199.0,
      sale: 149.0,
      currency: "USD",
    },
    badge: {
      text: "Best Value",
      backgroundColor: "oklch(65% 0.19 40)",
    },
  },
  {
    name: "Pro Player Collection",
    image: {
      src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      alt: "Pro Player Collection",
    },
    link: "#",
    description:
      "Signature series equipment used by professional players worldwide.",
    price: {
      regular: 799.0,
      currency: "USD",
    },
    badge: {
      text: "Premium",
      backgroundColor: "oklch(45% 0.2 280)",
    },
  },
];

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
            {PRODUCTS.map((product, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <a
                  href="/products"
                  className="block transition-opacity hover:opacity-80"
                >
                  <Card className="h-full overflow-hidden p-0">
                    <CardHeader className="relative block p-0">
                      <AspectRatio ratio={1.268115942} className="overflow-hidden">
                        <img
                          src={product.image.src}
                          alt={product.image.alt}
                          className="block size-full object-cover object-center"
                        />
                      </AspectRatio>
                      {product.badge && (
                        <Badge
                          style={{
                            background: product.badge.backgroundColor,
                          }}
                          className="absolute start-4 top-4"
                        >
                          {product.badge.text}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="flex h-full flex-col gap-4 pb-6">
                      <CardTitle className="text-xl font-semibold">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="font-medium text-muted-foreground">
                        {product.description}
                      </CardDescription>
                      <div className="mt-auto">
                        <Price onSale={product.price.sale != null} className="text-lg font-semibold">
                          <PriceValue
                            price={product.price.regular}
                            currency={product.price.currency}
                            variant="regular"
                          />
                          <PriceValue 
                            price={product.price.sale} 
                            currency={product.price.currency} 
                            variant="sale" 
                          />
                        </Price>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12" />
          <CarouselNext className="hidden md:flex -right-4 lg:-right-12" />
        </Carousel>
      </div>
    </section>
  );
}
