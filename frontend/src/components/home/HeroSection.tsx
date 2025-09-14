import {
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { ShoppingBag, ArrowRight } from "~/icons"; // use lucide-qwik instead of lucide-react
import { Button } from "~/components/ui/button"; // your Qwik Button wrapper



export const HeroSection = component$(() => {
  const state = useStore({ currentSlide: 0 });
  const heroSlides = [
  {
    title: "Premium Electronics Collection",
    subtitle: "Discover cutting-edge technology at unbeatable prices",
    cta: "Shop Electronics",
    image:
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=400&fit=crop",
    link: "/search?category=Electronics",
  },
  {
    title: "Fashion Forward Styles",
    subtitle: "Curated clothing and accessories for every occasion",
    cta: "Explore Fashion",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop",
    link: "/search?category=Clothing",
  },
  {
    title: "Home & Lifestyle",
    subtitle: "Transform your space with our carefully selected home goods",
    cta: "Shop Home",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop",
    link: "/search?category=Home",
  },
];
  // Auto-rotate every 5 seconds
  useVisibleTask$(() => {
    const interval = setInterval(() => {
      state.currentSlide =
        (state.currentSlide + 1) % heroSlides.length || 0;
    }, 5000);
    return () => clearInterval(interval);
  });

  return (
    <section class="relative h-[400px] md:h-[500px] overflow-hidden">
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          class={`absolute inset-0 transition-opacity duration-1000 ${
            index === state.currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div class="relative h-full">
            <img
              src={slide.image}
              alt={slide.title}
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-" />
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center max-w-3xl px-4">
                <h1 class="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  {slide.title}
                </h1>
                <p class="text-lg md:text-xl mb-8 text-white/90">
                  {slide.subtitle}
                </p>
                <Link href={slide.link}>
                  <Button
                    size="lg"
                    class={"text-black group"}
                  >
                    <ShoppingBag class="mr-2 h-5 w-5" />
                    {slide.cta}
                    
                    <ArrowRight class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick$={() => (state.currentSlide = index)}
            class={`w-3 h-3 rounded-full transition-all duration-300 bg-amber-300 ${
              index === state.currentSlide
                ? "bg-white scale-110"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
});
