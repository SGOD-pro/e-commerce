import { HeroSection } from "~/components/home/HeroSection";
import CategoryGrid from "~/components/home/CategoryGrid";
import { ProductCarousel } from "~/components/home/ProductCarousel";

import {
  $,
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  ALL_CATEGORIES_QUERY,
  graphqlRequest,
  PRODUCTS_QUERY,
} from "~/lib/Fetcher";
import { Category, ProductNew } from "../..";

import { HomeContent } from "~/context/store";
import { toast } from "qwik-sonner";

const Index = component$(() => {
  const useStore = useContext(HomeContent);
  const featuredProducts = useSignal<ProductNew[]>(
    useStore.featuredProducts || []
  );
  const recommendedProducts = useSignal<ProductNew[]>(
    useStore.recommendedProducts || []
  );
  const topRatedProducts = useSignal<ProductNew[]>(
    useStore.topRatedProducts || []
  );
  const recentProducts = useSignal<ProductNew[]>(useStore.recentProducts || []);
  const categories = useSignal<Category[]>(useStore.categories || []);

  useVisibleTask$(async () => {
    const tasks = [
      // Top Rated
      (async () => {
        if (!useStore.topRatedProducts?.length) {
          try {
            const data = await graphqlRequest<{ products: ProductNew[] }>(
              PRODUCTS_QUERY,
              {
                minRating: 4,
                limit: 10,
                sortBy: "average_rating",
              }
            );
            topRatedProducts.value = data.products;
            useStore.topRatedProducts = data.products;
          } catch (err) {
            toast.error("Failed to load Top Rated", {
              description: String(err),
            });
          }
        }
      })(),

      // Recommended
      (async () => {
        if (!useStore.recommendedProducts?.length) {
          try {
            const res = await fetch(
              "http://localhost:8000/products/recommend?limit=7",
              { credentials: "include" }
            );
            const data = await res.json();
            recommendedProducts.value = data.products;
            useStore.recommendedProducts = data.products;
          } catch (err) {
            toast.error("Failed to load Recommended", {
              description: String(err),
            });
          }
        }
      })(),

      // Recent
      (async () => {
        if (!useStore.recentProducts?.length) {
          try {
            const data = await graphqlRequest<{ products: ProductNew[] }>(
              PRODUCTS_QUERY
            );
            recentProducts.value = data.products;
            useStore.recentProducts = data.products;
          } catch (err) {
            toast.error("Failed to load Recent", {
              description: String(err),
            });
          }
        }
      })(),

      // Featured
      (async () => {
        if (!useStore.featuredProducts?.length) {
          try {
            const data = await graphqlRequest<{ products: ProductNew[] }>(
              PRODUCTS_QUERY,
              {
                limit: 10,
                minPrice: 10,
                maxPrice: 50,
                sortBy: "rating_number",
              }
            );
            featuredProducts.value = data.products;
            useStore.featuredProducts = data.products;
          } catch (err) {
            toast.error("Failed to load Featured", {
              description: String(err),
            });
          }
        }
      })(),

      // Categories
      (async () => {
        if (!useStore.categories?.length) {
          try {
            const data = await graphqlRequest<{ allCategories: Category[] }>(
              ALL_CATEGORIES_QUERY
            );
            categories.value = data.allCategories;
            useStore.categories = data.allCategories;
          } catch (err) {
            toast.error("Failed to load Categories", {
              description: String(err),
            });
          }
        }
      })(),
    ];

    // ✅ Run all in parallel
    await Promise.all(tasks);
  });

  return (
    <div class="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Categories Section */}
        <section class="mt-12">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-foreground mb-2">
                Shop by Category
              </h2>
              <p class="text-muted-foreground">
                Discover products in your favorite categories
              </p>
            </div>
            <CategoryGrid categories={categories.value} />
          </div>
        </section>

        {/* Featured Products */}
        <section class="">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductCarousel
              title="Featured Products"
              subtitle="Hand-picked favorites just for you"
              products={featuredProducts.value}
            />
          </div>
        </section>

        {/* Top Rated Products */}
        <section class="">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductCarousel
              title="Top Rated"
              subtitle="Highest rated products by our customers"
              products={topRatedProducts.value}
            />
          </div>
        </section>

        {/* Recommended Products */}
        <section class="">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductCarousel
              title="Recommended for You"
              subtitle="Products we think you'll love"
              products={recommendedProducts.value}
            />
          </div>
        </section>

        {/* New Arrivals */}
        <section class="">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductCarousel
              title="New Arrivals"
              subtitle="Latest products added to our collection"
              products={recentProducts.value}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer class="bg-surface border-t border-border mt-16 pt-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
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
                {categories.value.map((category, i) => (
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
