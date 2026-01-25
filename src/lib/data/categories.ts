export interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  imageHover?: string;
}

export const CATEGORY_INFO: Record<string, CategoryInfo> = {
  cricketbats: {
    slug: "cricketbats",
    name: "Cricket Bats",
    description: "Premium quality cricket bats from top brands",
    longDescription: "Explore our extensive collection of cricket bats crafted from premium English and Kashmir willow. From professional-grade bats to recreational options, find the perfect bat that matches your playing style and skill level.",
    image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1920&q=80",
    imageHover: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1920&q=80",
  },
  cricketgear: {
    slug: "cricketgear",
    name: "Sports Apparel",
    description: "Professional sports clothing and gear",
    longDescription: "High-performance cricket apparel designed for comfort and durability. Our collection includes jerseys, training gear, and professional cricket clothing from leading brands.",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1920&q=80",
  },
  cricketaccessories: {
    slug: "cricketaccessories",
    name: "Cricket Accessories",
    description: "Essential cricket accessories and equipment",
    longDescription: "Complete your cricket kit with our range of essential accessories including balls, stumps, grips, and other cricket equipment necessary for practice and matches.",
    image: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=1920&q=80",
  },
  cricketgloves: {
    slug: "cricketgloves",
    name: "Protection Gears",
    description: "Safety equipment and protection gear",
    longDescription: "Premium quality protective gear including batting gloves, helmets, pads, and guards. Ensure maximum safety while playing with our certified protection equipment.",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1920&q=80",
  },
  tapballbats: {
    slug: "tapballbats",
    name: "Tape Ball Bats",
    description: "Specialized bats for tape ball cricket",
    longDescription: "Discover our specialized collection of tape ball cricket bats. Designed specifically for tape ball cricket with enhanced durability and power hitting capabilities.",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1920&q=80",
  },
  cricketbags: {
    slug: "cricketbags",
    name: "Cricket Bags",
    description: "Durable cricket bags for all your equipment",
    longDescription: "Premium cricket bags and kit bags designed to protect and organize your cricket equipment. Available in various sizes to suit your needs.",
    image: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=1920&q=80",
  },
};

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return CATEGORY_INFO[slug];
}

export function getAllCategorySlugs(): string[] {
  return Object.keys(CATEGORY_INFO);
}
