import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { Category } from "../../..";
// import { Card } from "~/components/ui/card";



interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid = component$<CategoryGridProps>(({ categories }) => {
  return (
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`/search?category=${encodeURIComponent(category.name)}`}
          class="group"
        >
          <div class="card-product h-32 md:h-40 relative overflow-hidden cursor-pointer group-hover:scale-105 transition-transform duration-300 card">
            <img
              src={category.image}
              alt={category.name}
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-card/40 group-hover:bg-card/30 transition-colors duration-300" />
            <div class="absolute inset-0 flex flex-col justify-center items-center text-white">
              <h3 class="font-semibold text-sm md:text-lg text-center capitalize">
                {category.name}
              </h3>
              <p class="text-xs md:text-sm text-white/80 mt-1">
                {category.count} products
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
});

export default CategoryGrid;
