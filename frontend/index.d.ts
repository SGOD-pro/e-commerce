interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  slug?: string;
}
export interface ProductImage {
  large: string;
  variant?: string;
}

export interface ProductNew {
  id: string;
  title: string;
  description?: string[];
  features?: string[];
  categories: string[];
  store?: string;
  brand?: string;
  material?: string;
  color?: string;
  averageRating?: number;
  ratingNumber?: number;
  price?: number;
  images: ProductImage[];
}
interface Category {
  name: string;
  count?: number;
  image?: string;
}