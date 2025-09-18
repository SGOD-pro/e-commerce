// src/components/CategoryGrid.tsx
import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import type { Category } from "../../..";

interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid = component$<CategoryGridProps>(({ categories }) => {
  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`/search?category=${encodeURIComponent(category.name)}`}
          class="group"
        >
          <div class="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 aspect-[16/10]">
            <img
              src={category.image}
              alt={category.name}
              class="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:scale-[1.03] transition duration-500"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/10 to-transparent"></div>
            <div class="absolute bottom-0 p-4 text-white">
              <p class="text-base font-medium capitalize">{category.name}</p>
              <p class="text-xs text-white/70">{category.count} products</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
});

export default CategoryGrid;
