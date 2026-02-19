"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  IconPackage,
  IconShield,
  IconShirt,
  IconBackpack,
  IconArrowRight,
  IconStar,
  IconTrophy,
  IconUsers,
  IconTruck,
} from "@tabler/icons-react";

gsap.registerPlugin(ScrollTrigger);

// ─── Animated counter ────────────────────────────────────
function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const spring = useSpring(0, { mass: 0.8, stiffness: 60, damping: 15 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (isInView) spring.set(value);
  }, [isInView, value, spring]);

  useEffect(() => {
    return display.on("change", (v) => {
      if (ref.current) ref.current.textContent = v + suffix;
    });
  }, [display, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

// ─── Framer fade-up wrapper ──────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Gallery images ──────────────────────────────────────
const CRICKET_GALLERY = [
  "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
  "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
  "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80",
];

const STEEL_GALLERY = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "https://images.unsplash.com/photo-1565183928294-7d22f5ab9ddd?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
];

const PRODUCT_CATEGORIES = [
  {
    icon: <IconPackage className="size-8" />,
    title: "Cricket Bats",
    desc: "English & Kashmir willow bats from top brands like Ihsan, HS, CA & more",
    href: "/products/cricketbats",
  },
  {
    icon: <IconShield className="size-8" />,
    title: "Protection Gear",
    desc: "Helmets, pads, gloves & guards for complete safety",
    href: "/products/cricketgear",
  },
  {
    icon: <IconShirt className="size-8" />,
    title: "Cricket Accessories",
    desc: "Grips, tapes, oils & maintenance essentials",
    href: "/products/cricketaccessories",
  },
  {
    icon: <IconBackpack className="size-8" />,
    title: "Bags & Kits",
    desc: "Durable kit bags for every cricketer",
    href: "/products/cricketbags",
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Factory Partnership",
    desc: "We collaborate with premier cricket equipment manufacturers in Sialkot, ensuring authentic craftsmanship and superior materials in every product.",
  },
  {
    num: "02",
    title: "Quality Testing",
    desc: "Every cricket bat undergoes rigorous testing for balance, weight distribution, and performance before reaching our customers.",
  },
  {
    num: "03",
    title: "Direct to You",
    desc: "From our factories to your doorstep — we eliminate middlemen to provide the best prices without compromising quality.",
  },
];

// ─── Main About Page ─────────────────────────────────────
export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const steelGalleryRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);

  // ── GSAP ScrollTrigger animations ──
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero parallax
      if (heroRef.current) {
        const bg = heroRef.current.querySelector<HTMLElement>(".hero-bg");
        if (bg) {
          gsap.to(bg, {
            yPercent: 30,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      }

      // Cricket gallery stagger
      if (galleryRef.current) {
        const items =
          galleryRef.current.querySelectorAll<HTMLElement>(".gallery-item");
        gsap.fromTo(
          items,
          { y: 80, opacity: 0, scale: 0.92 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: galleryRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Steel gallery stagger
      if (steelGalleryRef.current) {
        const items =
          steelGalleryRef.current.querySelectorAll<HTMLElement>(".steel-gallery-item");
        gsap.fromTo(
          items,
          { y: 60, opacity: 0, rotateX: 8 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.65,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: steelGalleryRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Process cards slide-in
      if (processRef.current) {
        const cards =
          processRef.current.querySelectorAll<HTMLElement>(".process-card");
        gsap.fromTo(
          cards,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: processRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════
          HERO — parallax background + staggered text
         ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden flex items-center"
      >
        <div className="hero-bg absolute inset-0 -top-10 scale-110">
          <Image
            src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1920&q=80"
            alt="Cricket stadium"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-background" />
        </div>

        <div className="relative container mx-auto px-4 md:px-8 lg:px-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white font-semibold tracking-widest uppercase text-sm mb-4"
          >
            EST. 2010 · Rahim Yar Khan, Pakistan
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-3xl leading-tight"
          >
            Crafting Cricket
            <br />
            <span className="text-white">Excellence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-white/80 max-w-xl mb-8"
          >
            From the heart of Pakistan to cricket grounds worldwide — premium
            bats, gear & accessories built by craftsmen who live and breathe
            cricket.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Explore Products
              <IconArrowRight className="size-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS BAR
         ═══════════════════════════════════════════════════════ */}
      <section className="bg-primary/5 border-y border-border">
        <div className="container mx-auto px-4 md:px-8 lg:px-20 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 500, suffix: "+", label: "Products", icon: <IconPackage className="size-6" /> },
              { value: 10000, suffix: "+", label: "Happy Customers", icon: <IconUsers className="size-6" /> },
              { value: 50, suffix: "+", label: "Cities Served", icon: <IconTruck className="size-6" /> },
              { value: 25, suffix: "+", label: "Years Experience", icon: <IconTrophy className="size-6" /> },
            ].map((stat, i) => (
              <FadeUp key={stat.label} delay={i * 0.1}>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-primary">{stat.icon}</div>
                  <p className="text-3xl md:text-4xl font-bold">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          OUR STORY — text + animated gallery grid
         ═══════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 md:px-8 lg:px-20 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <FadeUp>
              <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">
                Our Story
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Born in the City of
                <br />
                <span className="text-primary">Master Craftsmanship</span>
              </h2>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="text-lg text-muted-foreground mb-5">
                Doaba Sports was founded in Sialkot — the global capital of
                sports manufacturing. For over 25 years, we've partnered with
                the finest bat-makers and gear artisans to bring
                professional-grade cricket equipment directly to players.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p className="text-lg text-muted-foreground mb-5">
                Every bat that leaves our facility is hand-selected, pressure-tested,
                and quality approved. We carry trusted brands like{" "}
                <span className="font-semibold text-foreground">Ihsan</span>,{" "}
                <span className="font-semibold text-foreground">HS Sports</span>,{" "}
                <span className="font-semibold text-foreground">CA Sports</span>, and
                many more — each representing the pinnacle of Pakistani
                cricket craftsmanship.
              </p>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="flex items-center gap-3 mt-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <IconStar
                    key={s}
                    className="size-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  Trusted by 10,000+ cricketers
                </span>
              </div>
            </FadeUp>
          </div>

          {/* GSAP-animated gallery grid */}
          <div ref={galleryRef} className="grid grid-cols-2 gap-4">
            {CRICKET_GALLERY.map((src, i) => (
              <motion.div
                key={src}
                className={`gallery-item relative overflow-hidden rounded-xl ${
                  i === 0 ? "row-span-2" : ""
                }`}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className={`relative ${i === 0 ? "h-full min-h-[400px]" : "aspect-square"}`}>
                  <Image
                    src={src}
                    alt={`Cricket gallery ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PROCESS STEPS — GSAP slide-in cards
         ═══════════════════════════════════════════════════════ */}
      <section className="bg-muted/40">
        <div className="container mx-auto px-4 md:px-8 lg:px-20 py-20">
          <FadeUp>
            <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3 text-center">
              How We Work
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-14">
              From Factory to Your Kit Bag
            </h2>
          </FadeUp>

          <div ref={processRef} className="space-y-6 max-w-3xl mx-auto">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.num}
                className="process-card flex gap-6 bg-background/80 backdrop-blur-sm border rounded-2xl p-6 md:p-8"
              >
                <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {step.num}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRODUCT CATEGORIES — staggered hover cards
         ═══════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 md:px-8 lg:px-20 py-20">
        <FadeUp>
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3 text-center">
            What We Offer
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-14">
            Everything a Cricketer Needs
          </h2>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCT_CATEGORIES.map((cat, i) => (
            <FadeUp key={cat.title} delay={i * 0.1}>
              <Link href={cat.href}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group bg-card border rounded-2xl p-8 text-center h-full cursor-pointer hover:shadow-xl hover:border-primary/30 transition-shadow"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {cat.icon}
                  </div>
                  <h4 className="font-bold text-lg mb-2">{cat.title}</h4>
                  <p className="text-sm text-muted-foreground">{cat.desc}</p>
                </motion.div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          DIVIDER
         ═══════════════════════════════════════════════════════ */}
      <div className="border-t border-border" />

      {/* ═══════════════════════════════════════════════════════
          STEEL BUSINESS SECTION
         ═══════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 md:px-8 lg:px-20 py-20">
        <FadeUp>
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3 text-center">
            Our Other Venture
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Doaba Steel & Pipe Corporation
          </h2>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-center mb-14">
            Beyond cricket, we manufacture and install premium steel gates,
            grills, and custom metalwork solutions for residential and
            commercial properties.
          </p>
        </FadeUp>

        {/* Steel stats with animated counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { value: 500, suffix: "+", label: "Gates Installed" },
            { value: 25, suffix: "+", label: "Years Experience" },
            { value: 100, suffix: "%", label: "Quality Assured" },
            { value: 24, suffix: "/7", label: "Support Available" },
          ].map((stat, i) => (
            <FadeUp key={stat.label} delay={i * 0.08}>
              <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 text-center border">
                <p className="text-3xl font-bold text-primary mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Steel gallery — GSAP stagger */}
        <FadeUp>
          <h3 className="text-3xl font-bold mb-8 text-center">
            Our Steel Work Gallery
          </h3>
        </FadeUp>

        <div
          ref={steelGalleryRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {STEEL_GALLERY.map((src, i) => (
            <motion.div
              key={src}
              className="steel-gallery-item group relative aspect-square overflow-hidden rounded-xl cursor-pointer"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Image
                src={src}
                alt={`Steel gate work ${i + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-semibold text-lg">
                  Project {i + 1}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <FadeUp>
          <div className="bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 md:p-12 text-center border border-primary/20">
            <h3 className="text-3xl font-bold mb-4">Need Custom Steel Work?</h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Contact Doaba Steel and Pipe Corporation for custom steel gates,
              grills, and metal fabrication solutions tailored to your needs.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Get a Quote
            </motion.button>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
