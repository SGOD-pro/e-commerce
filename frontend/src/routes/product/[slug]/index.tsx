import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import { useLocation, Link } from "@builder.io/qwik-city";
import { ArrowRight, Star, ShoppingCart, Heart, Share } from "~/icons";
import productsData from "~/data/products.json";
import { Button } from "~/components/ui/button";
import { ProductCard } from "~/components/ProductCard";

export default component$(() => {
  const location = useLocation();
  const slug = location.params.slug;
  console.log(slug);
  const product = useSignal<Product | null>(null);
  const recommendedProducts = useSignal<Product[]>([]);
  const quantity = useSignal(1);
  const isLoading = useSignal(true);

  const productsWithSlugs = productsData.map((product) => ({
    ...product,
    slug: product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
  }));

  useTask$(({ track }) => {
    track(() => slug);

    const foundProduct = productsWithSlugs.find((p) => p.slug === slug);

    if (foundProduct) {
      product.value = foundProduct;

      // Get recommended products from same category
      const recommended = productsWithSlugs
        .filter(
          (p) =>
            p.id !== foundProduct.id && p.category === foundProduct.category
        )
        .slice(0, 4);
      recommendedProducts.value = recommended;
    }

    isLoading.value = false;
  });

  const handleAddToCart = $(() => {
    if (!product.value) return;

    // Toast notification logic - you'll need to implement this
    console.log(`${quantity.value}x ${product.value.name} added to your cart`);
  });

  const handleAddToWishlist = $(() => {
    // Toast notification logic - you'll need to implement this
    console.log("Product saved to your wishlist");
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
          <span class="capitalize">{product.value.category}</span>
          <span>/</span>
          <span class="text-foreground">{product.value.name}</span>
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
              src={product.value.image}
              alt={product.value.name}
              class="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div class="space-y-6">
            <div>
              <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-2">
                {product.value.category}
              </span>
              <h1 class="text-3xl font-bold text-foreground">
                {product.value.name}
              </h1>
            </div>

            {/* Rating */}
            <div class="flex items-center space-x-2">
              <div class="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    class={`${
                      i < Math.floor(product.value!.rating)
                        ? "fill-foreground text-foreground"
                        : "text-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
              <span class="text-sm text-muted-foreground">
                {product.value.rating} ({product.value.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div class="text-2xl font-bold text-foreground">
              ${product.value.price.toFixed(2)}
            </div>

            {/* Description */}
            <div>
              <h3 class="font-semibold mb-2">Description</h3>
              <p class="text-muted-foreground leading-relaxed">
                {product.value.description}
              </p>
            </div>

            {/* Stock Status */}
            <div class="flex items-center space-x-2">
              <div
                class={`h-2 w-2 rounded-full ${product.value.inStock ? "bg-green-500" : "bg-red-500"}`}
              />
              <span class="text-sm">
                {product.value.inStock ? "In Stock" : "Out of Stock"}
              </span>
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
                <Button
                  onClick$={handleAddToCart}
                  disabled={!product.value.inStock}
                  class={"flex "}
                >
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

        {/* Recommended Products */}
        {recommendedProducts.value.length > 0 && (
          <section>
            <h2 class="text-2xl font-bold text-foreground mb-6">
              You might also like
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.value.map((recommendedProduct) => (
                <ProductCard
                  key={recommendedProduct.id}
                  product={recommendedProduct}
                  onQuickView$={() => console.log("Quick view:", product)}
                  onAddToCart$={() => console.log("Add to cart:", product)}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
});
