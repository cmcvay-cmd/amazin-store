export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  emoji: string;
  /** Image URL or base64 data URL from admin upload */
  image?: string;
  description: string;
  category: string;
  stock: number;
  variants?: string[];
};

export const INITIAL_PRODUCTS: Product[] = [];
  

export const CATEGORIES = [
  "All",
  "Checks",
  "Flowers",
  "jewelries",
  "Marriage certificate",
  "pizza",
  "Latters",
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Sports",
  "Deals",
  "Artificial Flowers",
  "Car keys",
  "Flowers&Later",
  "Vip Cards",
  "Custom prints",
];
