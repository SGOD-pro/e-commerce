import { component$, useSignal, $ } from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";
import {
  ArrowRight,
  StarFill,
  Star,
  ShoppingCart,
  Heart,
  Share,
} from "~/icons";
import { Button } from "~/components/ui/button";
import { ProductNew } from "../../../..";
import { graphqlRequest, PRODUCT_BY_ID_QUERY } from "~/lib/Fetcher";
import { Badge } from "~/components/ui/badge";
import Recomended from "./Recomended";
import { cn } from "~/lib/utils";

export const useProduct = routeLoader$<ProductNew | null>(
  async ({ params }) => {
    const slug = params.slug;
    console.log(slug);
    const data = await graphqlRequest<{ productById: ProductNew }>(
      PRODUCT_BY_ID_QUERY,
      { id: slug }
    );
    return data.productById ?? null;
  }
);

export default component$(() => {
  const product = useProduct(); // comes from loader
  const readFull = useSignal(false);
  const quantity = useSignal(1);
  const handleAddToWishlist = $(() => {
    console.log("Product saved to your wishlist");
  });
  const handleAddToCart = $(() => {
    console.log("Product added to your cart");
  });

  const increaseQuantity = $(() => {
    quantity.value = quantity.value + 1;
  });

  const decreaseQuantity = $(() => {
    quantity.value = Math.max(1, quantity.value - 1);
  });

  if (!product.value) {
    return (
      <div class="min-h-screen bg-background">
        <div class="max-w-7xl mx-auto px-4 py-8">
          <div class="text-center">
            <h1 class="text-2xl font-bold mb-4">Product not found</h1>
            <Link href="/">
              <button class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Return to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-background">
      <main class="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div class="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" class="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span class="capitalize">{product.value.categories[0]}</span>
        </div>

        {/* Back Button */}
        <Link
          href="/"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowRight class="mr-2 rotate-180" />
          Back to products
        </Link>

        {/* Product Details */}
        <div class="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div class="aspect-square bg-surface rounded-lg overflow-hidden">
            <img
              src={product.value.images[0].large}
              alt={product.value.brand}
              class="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div class="space-y-6">
            <div>
              <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-2">
                {product.value.categories[0]}
              </span>
              <h1 class="text-3xl font-bold text-foreground">
                {product.value.title}
              </h1>
            </div>

            {/* Rating */}
            <div class="flex items-center space-x-2">
              <div class="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) =>
                  i < Math.floor(product.value.averageRating || 0) ? (
                    <StarFill key={i} />
                  ) : (
                    <Star key={i}/>
                  )
                )}
              </div>
              <span class="text-sm text-muted-foreground">
                {product.value.averageRating} ({product.value.ratingNumber}{" "}
                reviews)
              </span>
            </div>

            {/* Price */}
            <div class="text-2xl font-bold text-foreground">
              ${product.value.price?.toFixed(2)}
            </div>

            {/* Description */}
            {product.value?.description ? (
              <div>
                <h3 class="font-semibold mb-2">Description</h3>
                <Badge>{product.value.store}</Badge>
                <p
                  class={cn(
                    "text-muted-foreground leading-relaxed",
                    !readFull.value && "line-clamp-6"
                  )}
                >
                  {product.value.description?.join(" ")}
                </p>

                <button
                  className="inline text-info text-right float-end cursor-pointer"
                  onClick$={() => (readFull.value = !readFull.value)}
                >
                  {readFull.value ? "Read less" : "Read more"}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground">
                  "No description available for this product."
                </p>
              </div>
            )}

            {/* Stock Status */}
            <div class="flex items-center space-x-2">
              <div
                class={`h-2 w-2 rounded-full ${true ? "bg-green-500" : "bg-red-500"}`}
              />
              <span class="text-sm">{true ? "In Stock" : "Out of Stock"}</span>
            </div>

            {/* Quantity and Actions */}
            <div class="space-y-4">
              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium">Quantity:</label>
                <div class="flex items-center border border-border rounded-md">
                  <button
                    onClick$={decreaseQuantity}
                    class="px-3 py-2 hover:bg-surface"
                  >
                    -
                  </button>
                  <span class="px-4 py-2 border-x border-border">
                    {quantity.value}
                  </span>
                  <button
                    onClick$={increaseQuantity}
                    class="px-3 py-2 hover:bg-surface"
                  >
                    +
                  </button>
                </div>
              </div>

              <div class="flex space-x-3">
                <Button onClick$={handleAddToCart} class={"flex "}>
                  <ShoppingCart />
                  Add to Cart
                </Button>
                <button
                  onClick$={handleAddToWishlist}
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                >
                  <Heart />
                </button>
                <button class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                  <Share class="" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-border my-12" />
        <Recomended id={product.value.id} />
      </main>
    </div>
  );
});
