'use client'
import { ArrowDownRight, Star } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import heroImage from '../../public/cricket-equipments-green-grass.jpg'


import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Example carousel images - replace with your actual images
const carouselImages = [
  {
    src: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
    alt: "Premium English Willow Cricket Bat",
  },
  {
    src: heroImage.src,
    alt: "Professional Cricket Equipment",
  },
  {
    src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
    alt: "Cricket Bat Collection",
  },
  {
    src: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=800&q=80",
    alt: "Kashmir Willow Bats",
  },
];

interface Hero3Props {
  heading?: string;
  description?: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
      className?: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
  reviews?: {
    count: number;
    avatars: {
      src: string;
      alt: string;
    }[];
    rating?: number;
  };
  images?: typeof carouselImages;
  className?: string;
}

const Hero3 = ({
  heading = "Doaba Sports",
  description = "Our English Willow bats are a true reflection of craftsmanship and quality. Carefully hand-selected from premium clefts, every bat is shaped and finished to meet professional standards.",
  buttons = {
    primary: {
      text: "Shop Now",
      url: "/shop",
    },
    secondary: {
      text: "View Collection",
      url: "/collections",
    },
  },
  reviews = {
    count: 200,
    rating: 5.0,
    avatars: [
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
        alt: "Customer 1",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
        alt: "Customer 2",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
        alt: "Customer 3",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
        alt: "Customer 4",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
        alt: "Customer 5",
      },
    ],
  },
  images = carouselImages,
  className,
}: Hero3Props) => {
  const [api, setApi] = useState<any>();
  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );
  return (  
    <section className={cn("py-4", className)}>
      <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="mx-auto flex flex-col items-center text-center md:ml-auto lg:max-w-3xl lg:items-start lg:text-left">
          <h1 className="my-6 text-pretty text-4xl font-bold lg:text-6xl xl:text-7xl">
            {heading}
          </h1>
          <p className="mb-8 max-w-xl text-muted-foreground lg:text-xl">
            {description}
          </p>
          <div className="mb-12 flex w-fit flex-col items-center gap-4 sm:flex-row">
            <span className="inline-flex items-center -space-x-4">
              {reviews.avatars.map((avatar, index) => (
                <Avatar key={index} className="size-12 border">
                  <AvatarImage src={avatar.src} alt={avatar.alt} />
                </Avatar>
              ))}
            </span>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className="size-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="mr-1 font-semibold">
                  {reviews.rating?.toFixed(1)}
                </span>
              </div>
              <p className="text-left font-medium text-muted-foreground">
                from {reviews.count}+ reviews
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
            {buttons.primary && (
              <Button asChild className="w-full sm:w-auto">
                <a href={buttons.primary.url}>{buttons.primary.text}</a>
              </Button>
            )}
            {buttons.secondary && (
              <Button asChild variant="outline">
                <a href={buttons.secondary.url}>
                  {buttons.secondary.text}
                  <ArrowDownRight className="size-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Carousel Section */}
        <div className="relative overflow-hidden rounded-3xl">
          <Carousel
            setApi={setApi}
            plugins={[plugin.current]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative  overflow-hidden rounded-3xl">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-[620px] w-full object-cover transition-transform duration-300 hover:scale-101"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export { Hero3 };