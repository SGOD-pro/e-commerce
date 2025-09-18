// src/components/ProductCard.tsx
import { component$, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { Eye, ShoppingCart, Star, StarFill } from "~/icons";
import { Button } from "~/components/ui/button";
import type { ProductNew } from "../..";

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

    // product slug / id used for routing - keep your original approach
    const productSlug = product.id;

    // Star rendering logic (full, half, outline)
    const avg = Math.floor(Number(product.averageRating ?? 0));

    const priceDisplay =
      product.price != null
        ? `$${Number(product.price).toLocaleString()}`
        : "--";

    return (
      <div
        class={`group relative h-full rounded-2xl border border-white/10 bg-base-200/60 p-3 hover:bg-base-200 transition ${className ?? ""} flex flex-col justify-between`}
      >
        <Link href={`/product/${productSlug}`} class="block">
          <div class="aspect-[4/3] overflow-hidden rounded-xl bg-base-300">
            {isImageLoading.value && !imageError.value && (
              <div class="w-full h-full bg-gradient-to-r from-neutral-800 to-neutral-900 animate-pulse" />
            )}

            {!imageError.value && product.images?.[0]?.large ? (
              <img
                src={product.images[0].large}
                alt={product.title}
                class="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                loading="lazy"
                onLoad$={() => (isImageLoading.value = false)}
                onError$={() => {
                  imageError.value = true;
                  isImageLoading.value = false;
                }}
              />
            ) : (
              <div class="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                Image unavailable
              </div>
            )}
          </div>

          <div class="mt-3">
            <h3 class="text-sm font-medium text-foreground line-clamp-2">
              {product.title}
            </h3>

            <p class="text-xs text-neutral-400 mt-1">
              {product.categories?.[0] ?? ""}
            </p>

            <div class="mt-2 flex items-center justify-between">
              <span class="text-sm font-semibold">{priceDisplay}</span>

              <div class="flex items-center gap-1 text-amber-300">
                {Array.from({ length: 5 }, (_, i) => {
                  if (i < avg) {
                    return <StarFill key={i} size={16} />;
                  } else {
                    return <Star key={i} size={16} />;
                  }
                })}
              </div>
            </div>
          </div>
        </Link>

        {/* Overlay actions (kept for quick view / add to cart UX) */}
        <div class="mt-3 flex items-center justify-end">
          <Button
            variant="outline"
            size="icon"
            class=""
            onClick$={(e) => {
              e.preventDefault();
              onAddToCart$?.(product);
            }}
          >
            <ShoppingCart class="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }
);

export default ProductCard;
