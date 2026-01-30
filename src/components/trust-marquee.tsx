"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  IconStar,
  IconTruck,
  IconShieldCheck,
  IconCertificate,
  IconHeadset,
  IconRefresh,
  IconCreditCard,
  IconPackage,
} from "@tabler/icons-react";

interface TrustItem {
  icon: React.ReactNode;
  text: string;
}

const trustItems: TrustItem[] = [
  { icon: <IconStar className="size-5" />, text: "5-Star Rated" },
  { icon: <IconTruck className="size-5" />, text: "Free Shipping Over Rs.5000" },
  { icon: <IconShieldCheck className="size-5" />, text: "100% Authentic Products" },
  { icon: <IconCertificate className="size-5" />, text: "Quality Guaranteed" },
  { icon: <IconHeadset className="size-5" />, text: "24/7 Customer Support" },
  { icon: <IconRefresh className="size-5" />, text: "Easy Returns" },
  { icon: <IconCreditCard className="size-5" />, text: "Secure Payments" },
  { icon: <IconPackage className="size-5" />, text: "COD Available" },
];

// Duplicate for seamless loop
const duplicatedItems = [...trustItems, ...trustItems];

interface TrustMarqueeProps {
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
}

export function TrustMarquee({
  className,
  speed = 30,
  pauseOnHover = true,
}: TrustMarqueeProps) {
  return (
    <section
      className={cn(
        "w-full py-4 bg-primary text-primary-foreground overflow-hidden",
        className
      )}
    >
      <div className="relative flex">
        <motion.div
          className="flex gap-8 items-center whitespace-nowrap"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            x: {
              duration: speed,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
          whileHover={pauseOnHover ? { animationPlayState: "paused" } : undefined}
          style={pauseOnHover ? { animationPlayState: "running" } : undefined}
        >
          {duplicatedItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 group cursor-default"
            >
              <span className="text-primary-foreground/80 group-hover:text-primary-foreground transition-colors">
                {item.icon}
              </span>
              <span className="font-medium text-sm md:text-base">
                {item.text}
              </span>
              <span className="mx-4 text-primary-foreground/40">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Alternative version with reverse direction
export function TrustMarqueeReverse({
  className,
  speed = 35,
}: TrustMarqueeProps) {
  return (
    <section
      className={cn(
        "w-full py-3 bg-muted/50 text-foreground overflow-hidden border-y",
        className
      )}
    >
      <div className="relative flex">
        <motion.div
          className="flex gap-8 items-center whitespace-nowrap"
          animate={{
            x: ["-50%", "0%"],
          }}
          transition={{
            x: {
              duration: speed,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
        >
          {duplicatedItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4"
            >
              <span className="text-muted-foreground">
                {item.icon}
              </span>
              <span className="font-medium text-sm text-muted-foreground">
                {item.text}
              </span>
              <span className="mx-4 text-muted-foreground/40">|</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
