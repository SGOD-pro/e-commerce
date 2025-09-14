import { HeroSection } from "~/components/home/HeroSection";
import CategoryGrid from "~/components/home/CategoryGrid";
import { ProductCarousel } from "~/components/home/ProductCarousel";

import productsData from "~/data/products.json";
import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { graphqlRequest, PRODUCTS_QUERY } from "~/lib/Fetcher";
import { Product, ProductNew } from "../..";

// Add slugs to products for SEO-friendly URLs
const productsWithSlugs = productsData.map((product) => ({
  ...product,
  slug: product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
}));

const Index = component$(() => {
  const products = useSignal<ProductNew[]>([]);
  const featuredProducts = useSignal<ProductNew[]>([]);
  const recommendedProducts = useSignal<Product[]>(productsData.slice(0, 8));
  const topRatedProducts = useSignal<Product[]>(productsData.slice(0, 8));
  const recentProducts = useSignal<Product[]>(productsData.slice(0, 8));

  // Get unique categories for homepage display
  const categories = Array.from(
    new Set(productsData.map((p) => p.category))
  ).map((category) => ({
    name: category,
    count: productsData.filter((p) => p.category === category).length,
    image: productsData.find((p) => p.category === category)?.image || "",
  }));

  useVisibleTask$(async () => {
    graphqlRequest<{ products: ProductNew[] }>(PRODUCTS_QUERY).then((data) => {
      products.value = data.products;
      console.log(products.value);
      const featured = data.products
        .filter(
          (p) => p.averageRating || (0 >= 4.5 && p.ratingNumber) || 0 > 1000
        )
        .slice(0, 8);
        console.log(featured)
      featuredProducts.value = featured;
    });

    // Recommended products (mix of categories)
    const recommended = [...productsData]
      .sort(() => 0.5 - Math.random())
      .slice(0, 12);
    recommendedProducts.value = recommended;

    // Top rated products
    const topRated = [...productsData]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
    topRatedProducts.value = topRated;

    // Recent/newest products (by ID)
    const recent = [...productsData].sort((a, b) => b.id - a.id).slice(0, 8);
    recentProducts.value = recent;
  });


  return (
    <div class="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Categories Section */}
        <section class="py-12">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-foreground mb-2">
                Shop by Category
              </h2>
              <p class="text-muted-foreground">
                Discover products in your favorite categories
              </p>
            </div>
            <CategoryGrid categories={categories} />
          </div>
        </section>

        {/* Featured Products */}
        <section class="py-12">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductCarousel
              title="Featured Products"
              subtitle="Hand-picked favorites just for you"
              products={featuredProducts.value}
            />
          </div>
        </section>


        {/* Top Rated Products */}
        {/* <section class="py-12 bg-card">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductCarousel
              title="Top Rated"
              subtitle="Highest rated products by our customers"
              products={products}
            />
          </div>
        </section> */}

        {/* Recommended Products */}
        {/* <section class="py-12">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductCarousel
              title="Recommended for You"
              subtitle="Products we think you'll love"
              products={recommendedProducts}
            />
          </div>
        </section> */}

        {/* New Arrivals */}
        {/* <section class="py-12 bg-surface">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductCarousel
              title="New Arrivals"
              subtitle="Latest products added to our collection"
              products={recentProducts}
            />
          </div>
        </section> */}
      </main>

      {/* Footer */}
      <footer class="bg-surface border-t border-border mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 class="font-bold text-lg mb-4 text-foreground">MONO</h3>
              <p class="text-sm text-muted-foreground">
                Premium e-commerce experience with curated products and
                exceptional service.
              </p>
            </div>
            <div>
              <h4 class="font-medium mb-4 text-foreground">Shop</h4>
              <ul class="space-y-2 text-sm text-muted-foreground">
                {categories.map((category, i) => (
                  <li key={i}>
                    <a
                      href={`/search?category=${encodeURIComponent(category.name as string)}`}
                      class="hover:text-foreground transition-colors capitalize"
                    >
                      {category.name as string}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 class="font-medium mb-4 text-foreground">Support</h4>
              <ul class="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" class="hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" class="hover:text-foreground transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" class="hover:text-foreground transition-colors">
                    Shipping
                  </a>
                </li>
                <li>
                  <a href="#" class="hover:text-foreground transition-colors">
                    Returns
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 class="font-medium mb-4 text-foreground">Company</h4>
              <ul class="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" class="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" class="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" class="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div class="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 MONO. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
});

export default Index;
