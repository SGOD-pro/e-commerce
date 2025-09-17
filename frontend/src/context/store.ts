import { createContextId } from "@builder.io/qwik";
import { Category, ProductNew } from "../..";

export const HomeContent = createContextId<{
  topRatedProducts: ProductNew[];
  recommendedProducts: ProductNew[];
  categories: Category[];
  featuredProducts: ProductNew[];
  newArrivals: ProductNew[];
  recentProducts: ProductNew[];
  cartItems: ProductNew[];
}>("home-page");
