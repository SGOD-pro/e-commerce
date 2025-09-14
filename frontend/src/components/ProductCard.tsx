import { component$, useSignal } from "@builder.io/qwik";
import { Button } from "~/components/ui/button";
import { Link } from "@builder.io/qwik-city";
import { Eye, ShoppingCart, Star, StarFill } from "~/icons";
import { Badge } from "./ui/badge";
import { ProductNew } from "../..";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  slug?: string;
}

interface ProductCardProps {
  product: ProductNew;
  onQuickView$?: (product: ProductNew) => void;
  onAddToCart$?: (product: ProductNew) => void;
  class?: string;
}

export const ProductCard = component$<ProductCardProps>(
  ({ product, onQuickView$, onAddToCart$, class: className }) => {
    const isImageLoading = useSignal(true);
    const imageError = useSignal(false);

    const productSlug = product.id

    return (
      <div class={`card-product border group bg-card h-full ${className || ""}`}>
        {/* Product Image */}
        <figure>
          <Link href={`/product/${productSlug}`}>
            <div class="relative aspect-square bg-surface overflow-hidden cursor-pointer">
              {isImageLoading.value && (
                <div class="absolute inset-0 loading-pulse rounded-t-lg" />
              )}

              {!imageError.value ? (
                <img
                  src={product.images[0].large}
                  alt={product.title}
                  class={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                    isImageLoading.value ? "opacity-0" : "opacity-100"
                  }`}
                  onLoad$={() => (isImageLoading.value = false)}
                  onError$={() => {
                    imageError.value = true;
                    isImageLoading.value = false;
                  }}
                />
              ) : (
                <div class="w-full h-full bg-muted flex items-center justify-center">
                  <span class="text-muted-foreground text-sm">
                    Image unavailable
                  </span>
                </div>
              )}

              {/* Overlay Actions */}
              <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  class=""
                  onClick$={(e, el) => {
                    e.preventDefault();
                    onQuickView$?.(product);
                  }}
                >
                  <Eye/>
                  Quick View
                </Button>
              </div>

              {/* Stock Status */}
              {!true&& (
                <div class="absolute top-3 left-3 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-medium rounded">
                  Out of Stock
                </div>
              )}
            </div>
          </Link>
        </figure>
        {/* Product Info */}
        <div class="p-4 space-y-3 card-body bg-surface">
          {/* Category */}
          <div class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {product.categories.join(", ")}
          </div>

          {/* Product Name */}
          <h3 class="font-medium text-sm leading-tight text-foreground group-hover:text-foreground/80 transition-colors line-clamp-2 card-title">
            {product.title}
          </h3>

          {/* Rating */}
          <div class="flex items-center space-x-2">
            <Badge class="flex items-center">
              <StarFill size={16}/>
              <span class="text-xs font-medium ml-1">{product.averageRating}</span>
            </Badge>
            <span class="text-xs text-muted-foreground">
              ({product.ratingNumber})
            </span>
          </div>

          {/* Price and Actions */}
          <div class="flex items-center justify-between pt-2">
            <span class="font-semibold text-foreground">
              ${product.price?.toFixed(2)}
            </span>

            <Button
              variant="ghost"
              size="sm"
              class="opacity-0 group-hover:opacity-100 transition-opacity p-2 h-auto"
              onClick$={(e) => {
                e.stopPropagation();
                onAddToCart$?.(product);
              }}
            >
              <ShoppingCart/>
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
