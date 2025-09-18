// src/components/ProductCarousel.tsx
import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Button } from "~/components/ui/button";
import { ProductCard } from "~/components/ProductCard";
import { NavArrowLeft, NavArrowRight } from "~/icons";
import type { EmblaCarouselType } from "embla-carousel";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: any[]; // replace with ProductNew[]
}

export const ProductCarousel = component$<ProductCarouselProps>(
  ({ title, subtitle, products }) => {
    const viewportRef = useSignal<HTMLDivElement | undefined>();
    const emblaApi = useSignal<EmblaCarouselType | null>(null);
    const canScrollPrev = useSignal(false);
    const canScrollNext = useSignal(false);

    useVisibleTask$(async ({ cleanup, track }) => {
      track(() => viewportRef.value);
      if (!viewportRef.value) {
        console.warn("[Embla] viewportRef is not set. Aborting init.");
        return;
      }

      let embla: EmblaCarouselType | null = null;

      try {
        const EmblaModule = await import("embla-carousel");
        const EmblaCtor = EmblaModule?.default ?? EmblaModule;

        embla = EmblaCtor(viewportRef.value!, {
          loop: false,
          align: "start",
          containScroll: "trimSnaps",
        });

        emblaApi.value = embla;

        const updateButtons = () => {
          canScrollPrev.value = !!embla && embla.canScrollPrev();
          canScrollNext.value = !!embla && embla.canScrollNext();
        };

        embla.on("init", updateButtons);
        embla.on("select", updateButtons);
        embla.on("reInit", updateButtons);
        window.addEventListener("load", () => embla?.reInit());

        updateButtons();
      } catch (err) {
        console.error("[Embla] failed to init:", err);
      }

      cleanup(() => {
        try {
          embla?.destroy();
        } catch (e) {}
        emblaApi.value = null;
      });
    });

    const scrollPrev = $(() => {
      if (!emblaApi.value)
        return console.warn("[Embla] scrollPrev called but emblaApi not ready");
      emblaApi.value.scrollPrev();
    });

    const scrollNext = $(() => {
      if (!emblaApi.value)
        return console.warn("[Embla] scrollNext called but emblaApi not ready");
      emblaApi.value.scrollNext();
    });

    if (!products || products.length === 0) return null;

    return (
      <div class="w-full my-12">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold">{title}</h2>
            <p class="text-muted-foreground">{subtitle}</p>
          </div>

          <div class="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick$={scrollPrev}
              disabled={!canScrollPrev.value}
              class="disabled:opacity-40"
              type="button"
            >
              <NavArrowLeft class="h-4 w-4" />
              <span class="sr-only">Previous slide</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick$={scrollNext}
              disabled={!canScrollNext.value}
              class="disabled:opacity-40"
              type="button"
            >
              <NavArrowRight class="h-4 w-4" />
              <span class="sr-only">Next slide</span>
            </Button>
          </div>
        </div>

        {/* Embla viewport (preserved logic) */}
        <div class="overflow-hidden" ref={viewportRef}>
          <div class="flex">
            {products.map((product) => (
              <div
                key={product.id}
                class="flex-none w-full sm:w-1/2 lg:w-1/4 pr-4 select-none"
              >
                <div className="h-full">
                  <ProductCard
                    product={product}
                    onQuickView$={() => console.log("Quick view:", product)}
                    onAddToCart$={() => console.log("Add to cart:", product)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
