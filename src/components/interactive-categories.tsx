"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconArrowRight } from "@tabler/icons-react";

interface Category {
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

const categories: Category[] = [
  {
    name: "Cricket Bats",
    slug: "bats",
    description: "Premium English & Kashmir Willow bats for all skill levels",
    image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&q=80",
    productCount: 150,
  },
  {
    name: "Cricket Balls",
    slug: "balls",
    description: "Professional leather balls for match & practice",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80",
    productCount: 80,
  },
  {
    name: "Protective Gear",
    slug: "protective-gear",
    description: "Helmets, pads, gloves & guards for complete protection",
    image: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=600&q=80",
    productCount: 120,
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Bags, grips, oils & everything you need",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80",
    productCount: 200,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

interface InteractiveCategoriesProps {
  className?: string;
}

export function InteractiveCategories({ className }: InteractiveCategoriesProps) {
  return (
    <section className={cn("w-full py-16 px-4 md:px-8 lg:px-20 bg-background", className)}>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Explore Collections
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect gear for your game from our curated categories
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((category, index) => (
            <motion.div key={category.slug} variants={cardVariants}>
              <Link href={`/categories/${category.slug}`} className="block group">
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative h-[380px] rounded-2xl overflow-hidden bg-card border shadow-sm"
                >
                  {/* Image with zoom effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    {/* Product count badge */}
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium"
                    >
                      {category.productCount}+ items
                    </motion.span>

                    <h3 className="text-2xl font-bold text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-white/80 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>

                    {/* Animated arrow */}
                    <motion.div
                      className="flex items-center gap-2 text-white font-medium"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                    >
                      <span>Shop Now</span>
                      <motion.div
                        className="group-hover:translate-x-1 transition-transform duration-300"
                      >
                        <IconArrowRight className="size-5" />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)",
                    }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
