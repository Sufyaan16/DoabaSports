"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconStarFilled,
  IconFlame,
  IconShoppingCart,
} from "@tabler/icons-react";
import type { Product } from "@/lib/data/products";

interface BestSellersProps {
  className?: string;
  products: Product[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

function formatPrice(price: number, currency: string = "Rs") {
  return `${currency} ${price.toLocaleString()}`;
}

export function BestSellers({ className, products }: BestSellersProps) {
  // Take first 4 products as best sellers
  const bestSellers = products.slice(0, 4);

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
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <IconFlame className="size-8 text-orange-500" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Best Sellers
            </h2>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <IconFlame className="size-8 text-orange-500" />
            </motion.div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our most popular products loved by cricketers across Pakistan
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {bestSellers.map((product, index) => (
            <motion.div key={product.id} variants={cardVariants}>
              <Link href={`/products/${product.id}`} className="block group">
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="relative overflow-hidden h-full">
                    {/* Rank Badge */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: 0.3 + index * 0.1, 
                        type: "spring",
                        stiffness: 200 
                      }}
                      className="absolute top-3 left-3 z-10"
                    >
                      <Badge 
                        className={cn(
                          "text-sm font-bold px-3 py-1",
                          index === 0 && "bg-yellow-500 hover:bg-yellow-600",
                          index === 1 && "bg-gray-400 hover:bg-gray-500",
                          index === 2 && "bg-amber-600 hover:bg-amber-700",
                          index === 3 && "bg-primary hover:bg-primary/90"
                        )}
                      >
                        #{index + 1}
                      </Badge>
                    </motion.div>

                    {/* Shimmer effect on rank badge */}
                    {index === 0 && (
                      <motion.div
                        className="absolute top-3 left-3 z-20 w-12 h-8 pointer-events-none"
                        animate={{
                          background: [
                            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                          ],
                          x: [-50, 50],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                        style={{ mixBlendMode: "overlay" }}
                      />
                    )}

                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <motion.img
                        src={product.image.src}
                        alt={product.image.alt}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                      />
                      
                      {/* Add to Cart overlay */}
                      {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      > */}
                        {/* <Button 
                          size="sm" 
                          className="w-full gap-2"
                          onClick={(e) => {
                            e.preventDefault();
                            // Add to cart logic
                          }}
                        >
                          <IconShoppingCart className="size-4" />
                          Quick Add
                        </Button> */}
                      {/* </motion.div> */}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <IconStarFilled
                            key={i}
                            className="size-3.5 text-yellow-400"
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          (4.{9 - index})
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>

                      {/* Company */}
                      <p className="text-sm text-muted-foreground mb-3">
                        {product.company}
                      </p>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        {product.price.sale ? (
                          <>
                            <span className="font-bold text-lg text-primary">
                              {formatPrice(product.price.sale, product.price.currency)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.price.regular, product.price.currency)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-lg">
                            {formatPrice(product.price.regular, product.price.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Button asChild variant="outline" size="lg" className="group">
            <Link href="/products">
              View All Products
              <motion.span
                className="ml-2"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
