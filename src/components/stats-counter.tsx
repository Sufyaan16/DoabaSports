"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  IconPackage, 
  IconUsers, 
  IconTruck, 
  IconTrophy 
} from "@tabler/icons-react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
}

const stats: Stat[] = [
  {
    value: 500,
    suffix: "+",
    label: "Products",
    icon: <IconPackage className="size-8" />,
  },
  {
    value: 10000,
    suffix: "+",
    label: "Happy Customers",
    icon: <IconUsers className="size-8" />,
  },
  {
    value: 50,
    suffix: "+",
    label: "Cities Served",
    icon: <IconTruck className="size-8" />,
  },
  {
    value: 15,
    suffix: "+",
    label: "Years Experience",
    icon: <IconTrophy className="size-8" />,
  },
];

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

interface StatsCounterProps {
  className?: string;
}

export function StatsCounter({ className }: StatsCounterProps) {
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
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Trusted by Cricketers Nationwide
          </h2>
          <p className="text-muted-foreground text-lg">
            Numbers that speak for our commitment to quality
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="mb-4 p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
              >
                {stat.icon}
              </motion.div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <AnimatedNumber value={stat.value} />
                <span>{stat.suffix}</span>
              </div>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
