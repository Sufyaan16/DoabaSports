export interface ProductPrice {
  regular: number;
  sale?: number;
  currency: string;
}

export interface Product {
  id: number;
  name: string;
  company: string;
  category: string;
  image: {
    src: string;
    alt: string;
  };
  imageHover?: {
    src: string;
    alt: string;
  };
  description: string;
  price: ProductPrice;
  badge?: {
    text: string;
    backgroundColor?: string;
  };
}

export const CRICKET_BATS: Product[] = [
  {
    id: 1,
    name: "Legend Pro Elite",
    company: "Ihsan",
    category: "cricketbats",
    image: {
      src: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
      alt: "Ihsan Legend Pro Elite Cricket Bat",
    },
    imageHover: {
      src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      alt: "Ihsan Legend Pro Elite Cricket Bat - Alternate View",
    },
    description: "Premium English willow bat with exceptional balance and power.",
    price: {
      regular: 349.0,
      sale: 299.0,
      currency: "USD",
    },
    badge: {
      text: "Best Seller",
      backgroundColor: "oklch(50.5% 0.213 27.518)",
    },
  },
  {
    id: 2,
    name: "Plus 15000",
    company: "CA",
    category: "cricketbats",
    image: {
      src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
      alt: "CA Plus 15000 Cricket Bat",
    },
    description: "Professional grade bat with superior stroke play capability.",
    price: {
      regular: 425.0,
      currency: "USD",
    },
    badge: {
      text: "Premium",
      backgroundColor: "oklch(45% 0.2 280)",
    },
  },
  {
    id: 3,
    name: "Malik Special Edition",
    company: "MB Malik",
    category: "cricketbats",
    image: {
      src: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=800&q=80",
      alt: "MB Malik Special Edition Cricket Bat",
    },
    description: "Handcrafted Kashmir willow bat for all-round performance.",
    price: {
      regular: 199.0,
      sale: 159.0,
      currency: "USD",
    },
    badge: {
      text: "Sale",
      backgroundColor: "oklch(65% 0.19 40)",
    },
  },
  {
    id: 4,
    name: "Ton Reserve Edition",
    company: "SS Sports",
    category: "cricketbats",
    image: {
      src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      alt: "SS Sports Ton Reserve Cricket Bat",
    },
    description: "Classic design with modern technology for power hitting.",
    price: {
      regular: 379.0,
      currency: "USD",
    },
  },
  {
    id: 5,
    name: "Dragon Signature",
    company: "Ihsan",
    category: "cricketbats",
    image: {
      src: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
      alt: "Ihsan Dragon Signature Cricket Bat",
    },
    description: "Lightweight design for quick stroke execution and control.",
    price: {
      regular: 289.0,
      sale: 249.0,
      currency: "USD",
    },
  },
  {
    id: 6,
    name: "Gold Edition 2024",
    company: "CA",
    category: "cricketbats",
    image: {
      src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
      alt: "CA Gold Edition Cricket Bat",
    },
    description: "Tournament-ready bat with excellent pick-up and balance.",
    price: {
      regular: 399.0,
      sale: 349.0,
      currency: "USD",
    },
    badge: {
      text: "New Arrival",
      backgroundColor: "oklch(60% 0.15 145)",
    },
  },
  {
    id: 7,
    name: "Power Drive Pro",
    company: "MB Malik",
    category: "cricketbats",
    image: {
      src: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=800&q=80",
      alt: "MB Malik Power Drive Pro Cricket Bat",
    },
    description: "Maximum power and durability for aggressive batsmen.",
    price: {
      regular: 229.0,
      currency: "USD",
    },
  },
  {
    id: 8,
    name: "Master Blaster Elite",
    company: "SS Sports",
    category: "cricketbats",
    image: {
      src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      alt: "SS Sports Master Blaster Cricket Bat",
    },
    description: "Designed for explosive batting with thick edges and spine.",
    price: {
      regular: 449.0,
      currency: "USD",
    },
    badge: {
      text: "Professional",
      backgroundColor: "oklch(50.5% 0.213 27.518)",
    },
  },
  {
    id: 9,
    name: "Royal Crown",
    company: "Ihsan",
    category: "cricketbats",
    image: {
      src: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
      alt: "Ihsan Royal Crown Cricket Bat",
    },
    description: "Premium craftsmanship with superior willow grading.",
    price: {
      regular: 319.0,
      sale: 279.0,
      currency: "USD",
    },
  },
  {
    id: 10,
    name: "Platinum Series",
    company: "CA",
    category: "cricketbats",
    image: {
      src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
      alt: "CA Platinum Series Cricket Bat",
    },
    description: "Top-tier performance bat for professional cricketers.",
    price: {
      regular: 499.0,
      currency: "USD",
    },
    badge: {
      text: "Pro Choice",
      backgroundColor: "oklch(45% 0.2 280)",
    },
  },
  {
    id: 11,
    name: "Thunder Strike",
    company: "MB Malik",
    category: "cricketbats",
    image: {
      src: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=800&q=80",
      alt: "MB Malik Thunder Strike Cricket Bat",
    },
    description: "Perfect balance between power and precision for match play.",
    price: {
      regular: 249.0,
      sale: 209.0,
      currency: "USD",
    },
    badge: {
      text: "Hot Deal",
      backgroundColor: "oklch(65% 0.19 40)",
    },
  },
  {
    id: 12,
    name: "Champion Series",
    company: "SS Sports",
    category: "cricketbats",
    image: {
      src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      alt: "SS Sports Champion Series Cricket Bat",
    },
    description: "Legendary design favored by international players.",
    price: {
      regular: 429.0,
      currency: "USD",
    },
  },
];
