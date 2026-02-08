"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { CategoryInfo } from "@/lib/data/categories";

interface CategoryCardsProps {
  className?: string;
  categories: CategoryInfo[];
}

function CategoryCard({ category }: { category: CategoryInfo }) {
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
          <Image
            src={displayImage}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-all duration-500 group-hover:scale-105"
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

export function CategoryCards({ className, categories }: CategoryCardsProps) {

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
