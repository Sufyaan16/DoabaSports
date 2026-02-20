"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { IconStarFilled, IconQuote } from "@tabler/icons-react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  review: string;
  productBought: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ahmad Khan",
    location: "Lahore",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    rating: 5,
    review: "Best quality English Willow bat I've ever used! The balance and pickup is absolutely perfect. Highly recommend Doaba Sports to all serious cricketers.",
    productBought: "Pro Player English Willow",
  },
  {
    id: 2,
    name: "Hassan Ali",
    location: "Karachi",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    rating: 5,
    review: "Amazing customer service and the bat quality exceeded my expectations. Fast delivery and proper packaging. Will definitely buy again!",
    productBought: "Kashmir Willow Classic",
  },
  {
    id: 3,
    name: "Usman Tariq",
    location: "Islamabad",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    rating: 5,
    review: "I've been using Doaba Sports bats for 3 years now. The craftsmanship is unmatched. My go-to store for all cricket equipment.",
    productBought: "Tournament Special",
  },
  {
    id: 4,
    name: "Bilal Ahmed",
    location: "Faisalabad",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
    rating: 5,
    review: "COD option made it so easy to order. The bat arrived in perfect condition. Great grains and fantastic ping. 100% genuine product!",
    productBought: "Elite Series Bat",
  },
  {
    id: 5,
    name: "Farhan Sheikh",
    location: "Multan",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&q=80",
    rating: 5,
    review: "Bought protective gear for my son. Excellent quality at reasonable prices. The helmet and pads are top-notch. Thank you Doaba Sports!",
    productBought: "Junior Protection Kit",
  },
];

function StarRating({ rating, animated = true }: { rating: number; animated?: boolean }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <motion.div
          key={index}
          initial={animated ? { opacity: 0, scale: 0 } : false}
          whileInView={animated ? { opacity: 1, scale: 1 } : undefined}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
          viewport={{ once: true }}
        >
          <IconStarFilled
            className={cn(
              "size-4",
              index < rating ? "text-yellow-400" : "text-muted-foreground/30"
            )}
          />
        </motion.div>
      ))}
    </div>
  );
}

interface TestimonialsCarouselProps {
  className?: string;
}

export function TestimonialsCarousel({ className }: TestimonialsCarouselProps) {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  return (
    <section className={cn("w-full py-16 px-4 md:px-8 lg:px-20 bg-muted/30", className)}>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied cricketers who trust Doaba Sports
          </p>
        </motion.div>

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
            {testimonials.map((testimonial, index) => (
              <CarouselItem
                key={testimonial.id}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Quote Icon */}
                      <motion.div
                        initial={{ opacity: 0, rotate: -10 }}
                        whileInView={{ opacity: 1, rotate: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4"
                      >
                        <IconQuote className="size-8 text-primary/20" />
                      </motion.div>

                      {/* Rating */}
                      <div className="mb-4">
                        <StarRating rating={testimonial.rating} />
                      </div>

                      {/* Review Text */}
                      <p className="text-muted-foreground grow mb-6 leading-relaxed">
                        "{testimonial.review}"
                      </p>

                      {/* Product Bought */}
                      <p className="text-xs text-primary font-medium mb-4">
                        Purchased: {testimonial.productBought}
                      </p>

                      {/* Customer Info */}
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <Avatar className="size-12 border-2 border-primary/20">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback>
                            {testimonial.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.location}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex -left-4" />
          <CarouselNext className="hidden lg:flex -right-4" />
        </Carousel>
      </div>
    </section>
  );
}
