"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { CATEGORY_INFO } from "@/lib/data/categories";

interface CategoryCardsProps {
  className?: string;
}

function CategoryCard({ category }: { category: typeof CATEGORY_INFO[string] }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const displayImage = isHovered && category.imageHover 
    ? category.imageHover 
    : category.image;

  return (
    <Link
      href={`/products/categories/${category.slug}`}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="relative h-75 overflow-hidden border-2 transition-all duration-300 hover:border-outline hover:shadow-2xl">
        <div className="relative w-full h-full">
          <img
            src={displayImage}
            alt={category.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

          {/* Content */}x
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {category.name}
            </h3>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function CategoryCards({ className }: CategoryCardsProps) {
  const categories = Object.values(CATEGORY_INFO);

  return (
    <section className={cn("w-full py-16 px-4 md:px-8 lg:px-20 bg-background", className)}>
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Browse Our Categories
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore our wide range of cricket equipment and accessories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
