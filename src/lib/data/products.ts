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
  // Inventory Management
  sku?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
}

// Cricket Bats
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

// Cricket Bags
export const CRICKET_BAGS: Product[] = [
  {
    id: 101,
    name: "Pro Kit Bag",
    company: "Kookaburra",
    category: "cricketbags",
    image: {
      src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      alt: "Kookaburra Pro Kit Bag",
    },
    imageHover: {
      src: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&q=80",
      alt: "Kookaburra Pro Kit Bag - Alternate View",
    },
    description: "Large capacity cricket bag with multiple compartments for all your gear.",
    price: {
      regular: 129.0,
      sale: 99.0,
      currency: "USD",
    },
    badge: {
      text: "Popular",
      backgroundColor: "oklch(50.5% 0.213 27.518)",
    },
  },
  {
    id: 102,
    name: "Wheelie Kit Bag",
    company: "Gray-Nicolls",
    category: "cricketbags",
    image: {
      src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      alt: "Gray-Nicolls Wheelie Kit Bag",
    },
    description: "Wheeled cricket bag for easy transportation of heavy equipment.",
    price: {
      regular: 179.0,
      currency: "USD",
    },
  },
  {
    id: 103,
    name: "Duffle Cricket Bag",
    company: "SG",
    category: "cricketbags",
    image: {
      src: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&q=80",
      alt: "SG Duffle Cricket Bag",
    },
    description: "Lightweight duffle bag perfect for training sessions.",
    price: {
      regular: 69.0,
      sale: 49.0,
      currency: "USD",
    },
  },
  {
    id: 104,
    name: "Team Kit Bag",
    company: "Ihsan",
    category: "cricketbags",
    image: {
      src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      alt: "Ihsan Team Kit Bag",
    },
    description: "Professional team bag with reinforced base and waterproof material.",
    price: {
      regular: 149.0,
      currency: "USD",
    },
    badge: {
      text: "New",
      backgroundColor: "oklch(65% 0.19 40)",
    },
  },
];

// Protection Gears
export const PROTECTION_GEARS: Product[] = [
  {
    id: 201,
    name: "Elite Batting Gloves",
    company: "Kookaburra",
    category: "cricketgloves",
    image: {
      src: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
      alt: "Kookaburra Elite Batting Gloves",
    },
    imageHover: {
      src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      alt: "Kookaburra Elite Batting Gloves - Alternate View",
    },
    description: "Premium leather batting gloves with superior grip and protection.",
    price: {
      regular: 89.0,
      sale: 69.0,
      currency: "USD",
    },
    badge: {
      text: "Best Seller",
      backgroundColor: "oklch(50.5% 0.213 27.518)",
    },
  },
  {
    id: 202,
    name: "Pro Guard Helmet",
    company: "Masuri",
    category: "cricketgloves",
    image: {
      src: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=800&q=80",
      alt: "Masuri Pro Guard Helmet",
    },
    description: "Certified cricket helmet with titanium grille and superior protection.",
    price: {
      regular: 199.0,
      currency: "USD",
    },
  },
  {
    id: 203,
    name: "Leg Guard Pads",
    company: "Gray-Nicolls",
    category: "cricketgloves",
    image: {
      src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
      alt: "Gray-Nicolls Leg Guard Pads",
    },
    description: "Lightweight yet protective batting pads with comfortable straps.",
    price: {
      regular: 149.0,
      sale: 129.0,
      currency: "USD",
    },
  },
  {
    id: 204,
    name: "Thigh & Arm Guards Set",
    company: "SG",
    category: "cricketgloves",
    image: {
      src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      alt: "SG Thigh & Arm Guards Set",
    },
    description: "Complete protection set including thigh guards and arm guards.",
    price: {
      regular: 79.0,
      currency: "USD",
    },
    badge: {
      text: "Bundle",
      backgroundColor: "oklch(65% 0.19 40)",
    },
  },
  {
    id: 205,
    name: "Wicket Keeping Gloves",
    company: "SS Sports",
    category: "cricketgloves",
    image: {
      src: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
      alt: "SS Sports Wicket Keeping Gloves",
    },
    description: "Professional wicket keeping gloves with extra padding.",
    price: {
      regular: 119.0,
      currency: "USD",
    },
  },
];

// Sports Apparel
export const SPORTS_APPAREL: Product[] = [
  {
    id: 301,
    name: "Team Jersey Set",
    company: "Nike",
    category: "cricketgear",
    image: {
      src: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80",
      alt: "Nike Team Jersey Set",
    },
    imageHover: {
      src: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&q=80",
      alt: "Nike Team Jersey Set - Alternate View",
    },
    description: "Breathable cricket jersey with moisture-wicking technology.",
    price: {
      regular: 79.0,
      sale: 59.0,
      currency: "USD",
    },
    badge: {
      text: "Popular",
      backgroundColor: "oklch(50.5% 0.213 27.518)",
    },
  },
  {
    id: 302,
    name: "Training Pants",
    company: "Adidas",
    category: "cricketgear",
    image: {
      src: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80",
      alt: "Adidas Training Pants",
    },
    description: "Comfortable cricket pants with stretch fabric for maximum movement.",
    price: {
      regular: 59.0,
      currency: "USD",
    },
  },
  {
    id: 303,
    name: "Cricket Shoes",
    company: "Puma",
    category: "cricketgear",
    image: {
      src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      alt: "Puma Cricket Shoes",
    },
    description: "Professional cricket shoes with spike support for better grip.",
    price: {
      regular: 129.0,
      sale: 99.0,
      currency: "USD",
    },
  },
  {
    id: 304,
    name: "Training T-Shirt Pack",
    company: "Under Armour",
    category: "cricketgear",
    image: {
      src: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&q=80",
      alt: "Under Armour Training T-Shirt Pack",
    },
    description: "Pack of 3 breathable training t-shirts for practice sessions.",
    price: {
      regular: 89.0,
      currency: "USD",
    },
    badge: {
      text: "Pack of 3",
      backgroundColor: "oklch(65% 0.19 40)",
    },
  },
  {
    id: 305,
    name: "Cricket Cap",
    company: "New Balance",
    category: "cricketgear",
    image: {
      src: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80",
      alt: "New Balance Cricket Cap",
    },
    description: "UV protection cricket cap with adjustable strap.",
    price: {
      regular: 29.0,
      currency: "USD",
    },
  },
];

// Cricket Accessories
export const CRICKET_ACCESSORIES: Product[] = [
  {
    id: 401,
    name: "Leather Cricket Ball Set",
    company: "Kookaburra",
    category: "cricketaccessories",
    image: {
      src: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=800&q=80",
      alt: "Kookaburra Leather Cricket Ball Set",
    },
    description: "Professional grade leather cricket balls, pack of 6.",
    price: {
      regular: 89.0,
      sale: 69.0,
      currency: "USD",
    },
    badge: {
      text: "Pack of 6",
      backgroundColor: "oklch(50.5% 0.213 27.518)",
    },
  },
  {
    id: 402,
    name: "Bat Grip Pack",
    company: "Gray-Nicolls",
    category: "cricketaccessories",
    image: {
      src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
      alt: "Gray-Nicolls Bat Grip Pack",
    },
    description: "Premium bat grips for better control, pack of 5.",
    price: {
      regular: 24.0,
      currency: "USD",
    },
  },
  {
    id: 403,
    name: "Stumps Set with Bails",
    company: "SG",
    category: "cricketaccessories",
    image: {
      src: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=800&q=80",
      alt: "SG Stumps Set with Bails",
    },
    description: "Complete stumps set with bails for practice and matches.",
    price: {
      regular: 49.0,
      currency: "USD",
    },
  },
  {
    id: 404,
    name: "Bat Care Kit",
    company: "SS Sports",
    category: "cricketaccessories",
    image: {
      src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
      alt: "SS Sports Bat Care Kit",
    },
    description: "Complete maintenance kit including oil, tape, and sandpaper.",
    price: {
      regular: 39.0,
      sale: 29.0,
      currency: "USD",
    },
  },
];

// Tape Ball Bats
export const TAPE_BALL_BATS: Product[] = [
  {
    id: 501,
    name: "Power Hitter Tape Bat",
    company: "CA Sports",
    category: "tapballbats",
    image: {
      src: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
      alt: "CA Sports Power Hitter Tape Bat",
    },
    imageHover: {
      src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      alt: "CA Sports Power Hitter Tape Bat - Alternate View",
    },
    description: "Heavy blade tape ball bat designed for maximum power hitting.",
    price: {
      regular: 89.0,
      sale: 69.0,
      currency: "USD",
    },
    badge: {
      text: "Popular",
      backgroundColor: "oklch(50.5% 0.213 27.518)",
    },
  },
  {
    id: 502,
    name: "Street Cricket Bat",
    company: "Ihsan",
    category: "tapballbats",
    image: {
      src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
      alt: "Ihsan Street Cricket Bat",
    },
    description: "Durable tape ball bat perfect for street cricket matches.",
    price: {
      regular: 59.0,
      currency: "USD",
    },
  },
  {
    id: 503,
    name: "Junior Tape Ball Bat",
    company: "SG",
    category: "tapballbats",
    image: {
      src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      alt: "SG Junior Tape Ball Bat",
    },
    description: "Lightweight tape ball bat ideal for junior players.",
    price: {
      regular: 39.0,
      currency: "USD",
    },
    badge: {
      text: "Junior",
      backgroundColor: "oklch(65% 0.19 40)",
    },
  },
];

// Combine all products
export const ALL_PRODUCTS: Product[] = [
  ...CRICKET_BATS,
  ...CRICKET_BAGS,
  ...PROTECTION_GEARS,
  ...SPORTS_APPAREL,
  ...CRICKET_ACCESSORIES,
  ...TAPE_BALL_BATS,
];
