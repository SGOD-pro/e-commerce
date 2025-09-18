// src/components/HeroSection.tsx
import {
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { ShoppingBag, ArrowRight } from "~/icons"; // keep your icon wrapper
import { Button } from "~/components/ui/button";

export const HeroSection = component$(() => {
  const state = useStore({ currentSlide: 0 });
  const heroSlides = [
    {
      title: "Premium Electronics Collection",
      subtitle: "Discover cutting-edge technology at unbeatable prices",
      cta: "Shop Electronics",
      image:
        "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920&q=80&auto=format&fit=crop",
      link: "/search?category=Electronics",
    },
    {
      title: "Cameras that elevate every shot",
      subtitle: "From compact to full-frame, capture more with premium glass.",
      cta: "Explore Cameras",
      image:
        "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1920&q=80&auto=format&fit=crop",
      link: "/search?category=Cameras",
    },
    {
      title: "Immersive audio for every moment",
      subtitle: "Noise-cancelling headphones and studio monitors built to focus your flow.",
      cta: "Shop Audio",
      image:
        "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1920&q=80&auto=format&fit=crop",
      link: "/search?category=Audio",
    },
  ];

  // Auto-rotate every 5s (kept your logic)
  useVisibleTask$(() => {
    const interval = setInterval(() => {
      state.currentSlide = (state.currentSlide + 1) % heroSlides.length;
    }, 5000);
    return () => clearInterval(interval);
  });

  return (
    <section class="relative">
      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div class="relative overflow-hidden rounded-3xl border border-white/10">
          <div class="relative h-[58vh] md:h-[68vh]">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                class={`hero-slide absolute inset-0 transition-opacity duration-700 ease-out ${index === state.currentSlide ? "opacity-100" : "opacity-0"}`}
                data-index={String(index)}
                style={{
                  backgroundImage: `url('${slide.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div class="absolute inset-0 bg-gradient-to-b from-neutral-950/30 via-neutral-950/50 to-neutral-950"></div>
                <div class="relative h-full flex items-center">
                  <div class="px-6 md:px-12 lg:px-16">
                    <div class="max-w-2xl text-white">
                      <p class="text-xs md:text-sm text-white/70 mb-3">New Season</p>
                      <h1 class="text-4xl md:text-5xl lg:text-6xl tracking-tight font-semibold leading-tight">
                        {slide.title}
                      </h1>
                      <p class="mt-4 text-sm md:text-base text-white/80">{slide.subtitle}</p>
                      <div class="mt-6 flex items-center gap-3">
                        <Link href={slide.link}>
                          <Button size="lg" class="inline-flex items-center gap-2 rounded-xl bg-white text-neutral-900 px-4 py-2.5 text-sm font-medium hover:bg-white/90 transition">
                            <ShoppingBag class="mr-2 h-5 w-5" />
                            {slide.cta}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider Controls (dots) */}
            <div class="pointer-events-none absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  class={`dot pointer-events-auto h-2.5 w-2.5 rounded-full transition ${i === state.currentSlide ? "bg-white/80" : "bg-white/20 hover:bg-white/80"}`}
                  data-index={String(i)}
                  aria-label={`Slide ${i + 1}`}
                  onClick$={() => (state.currentSlide = i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
