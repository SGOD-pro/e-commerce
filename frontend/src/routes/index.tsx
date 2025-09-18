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
    if (!useStore.topRatedProducts || useStore.topRatedProducts.length === 0) {
      const fetchTopRated = graphqlRequest<{ products: ProductNew[] }>(
        PRODUCTS_QUERY,
        {
          minRating: 4,
          limit: 10,
          sortBy: "average_rating",
        }
      ).then((data) => {
        topRatedProducts.value = data.products;
        useStore.topRatedProducts = data.products;
      });
    }
    if (!useStore.recommendedProducts||useStore.recommendedProducts?.length === 0) {
      const fetchRecommended = graphqlRequest<{ products: ProductNew[] }>(
        PRODUCTS_QUERY,
        {
          limit: 8,
        }
      ).then((data) => {
        recommendedProducts.value = data.products;
        useStore.recommendedProducts = data.products;
      });
    }
    if (!useStore.recentProducts|| useStore.recentProducts?.length === 0) {
      const fetchRecent = graphqlRequest<{ products: ProductNew[] }>(
        PRODUCTS_QUERY
      ).then((data) => {
        recentProducts.value = data.products;
        useStore.recentProducts = data.products;
      });
    }
    if (!useStore.featuredProducts || useStore.featuredProducts?.length === 0) {
      const fetchfeaturedProducts = graphqlRequest<{ products: ProductNew[] }>(
        PRODUCTS_QUERY,
        {
          limit: 10,
          minPrice: 10,
          maxPrice: 50,
          sortBy: "rating_number",
        }
      ).then((data) => {
        featuredProducts.value = data.products;
        useStore.featuredProducts = data.products;
      });
    }
    if (!useStore.categories || useStore.categories?.length === 0) {
      const fetchCategory = graphqlRequest<{ allCategories: Category[] }>(
        ALL_CATEGORIES_QUERY
      ).then((data) => {
        console.log(data);
        categories.value = data.allCategories;
        useStore.categories = data.allCategories;
      });
    }
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
            <CategoryGrid categories={categories.value} />
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
        <section class="py-12 bg-card">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductCarousel
              title="Top Rated"
              subtitle="Highest rated products by our customers"
              products={topRatedProducts.value}
            />
          </div>
        </section>

        {/* Recommended Products */}
        <section class="py-12">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductCarousel
              title="Recommended for You"
              subtitle="Products we think you'll love"
              products={recommendedProducts.value}
            />
          </div>
        </section>

        {/* New Arrivals */}
        <section class="py-12 bg-card">
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
