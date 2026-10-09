export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  emoji: string;
  description: string;
  category: string;
  stock: number;
  variants?: string[];
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Wireless Earbuds Pro",
    brand: "SOUNDMAX",
    price: 49.99,
    oldPrice: 89.99,
    rating: 4.8,
    reviews: 2341,
    emoji: "🎧",
    description:
      "Premium wireless earbuds with active noise cancellation, 30h battery life, IPX5 water resistance and crystal-clear calls.",
    category: "Electronics",
    stock: 42,
    variants: ["Black", "White", "Pink"],
  },
  {
    id: "2",
    name: "Smart Watch X3",
    brand: "TECHWEAR",
    price: 129.0,
    oldPrice: 199.0,
    rating: 4.6,
    reviews: 1892,
    emoji: "⌚",
    description:
      "Advanced fitness tracking, heart-rate monitoring, GPS, and 7-day battery. Water resistant to 50m.",
    category: "Electronics",
    stock: 18,
    variants: ["Black", "Silver", "Rose Gold"],
  },
  {
    id: "3",
    name: "Minimal Desk Lamp",
    brand: "LUMINA",
    price: 34.5,
    oldPrice: 59.0,
    rating: 4.9,
    reviews: 876,
    emoji: "💡",
    description:
      "Adjustable LED desk lamp with 3 color temperatures and touch dimmer. USB-C charging port.",
    category: "Home",
    stock: 67,
    variants: ["Black", "White"],
  },
  {
    id: "4",
    name: "Leather Crossbody",
    brand: "ATELIER",
    price: 79.0,
    oldPrice: 120.0,
    rating: 4.7,
    reviews: 543,
    emoji: "👜",
    description:
      "Genuine leather crossbody bag with adjustable strap and multiple compartments. Timeless design.",
    category: "Fashion",
    stock: 9,
    variants: ["Tan", "Black", "Burgundy"],
  },
  {
    id: "5",
    name: "Running Sneakers Air",
    brand: "VELOCITY",
    price: 89.99,
    oldPrice: 140.0,
    rating: 4.5,
    reviews: 1203,
    emoji: "👟",
    description:
      "Lightweight running shoes with responsive cushioning and breathable mesh upper.",
    category: "Sports",
    stock: 31,
    variants: ["White/Pink", "Black", "Navy"],
  },
  {
    id: "6",
    name: "Skincare Glow Set",
    brand: "GLOWLAB",
    price: 45.0,
    oldPrice: 68.0,
    rating: 4.8,
    reviews: 2104,
    emoji: "✨",
    description:
      "Complete 4-step routine: cleanser, toner, serum, and moisturizer. For all skin types.",
    category: "Beauty",
    stock: 55,
  },
];

export const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Sports",
  "Deals",
];
