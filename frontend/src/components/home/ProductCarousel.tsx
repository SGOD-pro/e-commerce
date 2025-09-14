import { $, component$, useSignal, type Signal } from "@builder.io/qwik";
import { Button } from "~/components/ui/button";
import { ProductCard } from "~/components/ProductCard";
import { NavArrowLeft, NavArrowRight } from "~/icons";
import { ProductNew } from "../../..";

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

interface ProductCarouselProps {
  title: string;
  subtitle: string;
  products: ProductNew[]; // 👈 use Signal
}

export const ProductCarousel = component$<ProductCarouselProps>(
  ({ title, subtitle, products }) => {
    const currentIndex = useSignal(0);
    const itemsPerPage = 4;

    const maxIndex = Math.max(0, Math.ceil(products.length / itemsPerPage) - 1);

    const nextSlide = $(() => {
      currentIndex.value =
        currentIndex.value >= maxIndex ? 0 : currentIndex.value + 1;
    });

    const prevSlide = $(() => {
      currentIndex.value =
        currentIndex.value <= 0 ? maxIndex : currentIndex.value - 1;
    });

    if (products.length === 0) return null;

    return (
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-foreground">{title}</h2>
            <p class="text-muted-foreground">{subtitle}</p>
          </div>

          {products.length > itemsPerPage && (
            <div class="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick$={prevSlide}
                disabled={currentIndex.value === 0}
                class="h-8 w-8"
              >
                <NavArrowLeft/>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick$={nextSlide}
                disabled={currentIndex.value === maxIndex}
                class="h-8 w-8"
              >
                <NavArrowRight/>
              </Button>
            </div>
          )}
        </div>

        {/* Carousel container */}
        <div class="relative overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex.value * 100}%)`,
            }}
          >
            {Array.from({
              length: Math.ceil(products.length / itemsPerPage),
            }).map((_, pageIndex) => (
              <div key={pageIndex} class="flex w-full flex-shrink-0 gap-4">
                {products
                  .slice(
                    pageIndex * itemsPerPage,
                    (pageIndex + 1) * itemsPerPage
                  )
                  .map((product) => (
                    <div key={product.id} class="w-1/4 flex-shrink-0">
                      <ProductCard
                        product={product}
                        onQuickView$={() => console.log("Quick view:", product)}
                        onAddToCart$={() =>
                          console.log("Add to cart:", product)
                        }
                      />
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator */}
        {products.length > itemsPerPage && (
          <div class="flex justify-center space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick$={() => (currentIndex.value = index)}
                class={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex.value
                    ? "bg-foreground scale-110"
                    : "bg-muted-foreground hover:bg-foreground/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);
