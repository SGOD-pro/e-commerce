import {
  component$,
  useSignal,
  useTask$,
  $,
  useComputed$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { Filter, X } from "~/icons";
import { ProductCard } from "~/components/ProductCard";
import { ProductNew } from "../../..";
import { graphqlRequest, PRODUCTS_QUERY } from "~/lib/Fetcher";

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  inStock: boolean;
  sortBy: "name" | "price-low" | "price-high" | "rating";
}

// SearchResultsInfo component
const SearchResultsInfo = component$<{
  searchQuery: string;
  resultsCount: number;
}>((props) => (
  <div class="text-sm text-muted-foreground">
    {props.searchQuery ? (
      <>
        Showing {props.resultsCount} results for{" "}
        <span class="font-medium text-foreground">"{props.searchQuery}"</span>
      </>
    ) : (
      `Showing ${props.resultsCount} products`
    )}
  </div>
));

async function fetchProductsFromServer(variables: Record<string, any>) {
  const res=await graphqlRequest<{ products: ProductNew[] }>(PRODUCTS_QUERY, variables)
  return res.products || [];
}
// const ActiveFiltersBadge = component$<{ count: number }>((props) => {
//   if (props.count === 0) return null;
//   return (
//     <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 ml-2 h-5 w-5 p-0 justify-center">
//       {props.count}
//     </span>
//   );
// });

export default component$(() => {
  const location = useLocation();
  const products = useSignal<any[]>([]);
  const isLoading = useSignal(false);
  const error = useSignal<string | null>(null);

  const query = useComputed$(() => location.url.searchParams.get("q") || "");

  useVisibleTask$(async ({ track }) => {
    track(() => location.url.searchParams.toString());
    const q = query.value.trim();

    if (!q) {
      products.value = [];
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const vars = { search: q, limit: 20 };
      const result = await fetchProductsFromServer(vars);
      products.value = result;
    } catch (err: any) {
      console.error("Search fetch error:", err);
      error.value = err?.message || "Failed to load products";
      products.value = [];
    } finally {
      isLoading.value = false;
    }
  });

  return (
    <main class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-semibold mb-4">Search results for "{query.value}"</h1>

      {isLoading.value ? (
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      ) : error.value ? (
        <div class="text-red-500">{error.value}</div>
      ) : products.value.length > 0 ? (
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.value.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView$={() => console.log("Quick view:", product)}
              onAddToCart$={() => console.log("Add to cart:", product)}
            />
          ))}
        </div>
      ) : (
        <div class="text-center py-12 text-muted-foreground">
          No products found. Try different keywords.
        </div>
      )}
    </main>
  );
});

// // Navigation component placeholder
// const Navigation = component$<{
//   onSearchChange: (query: string) => void;
// }>((props) => {
//   return <nav>{/* Your navigation content with search */}</nav>;
// });

// // ProductFilters component placeholder
// const ProductFilters = component$<{
//   categories: string[];
//   filters: FilterState;
//   onFiltersChange: (filters: FilterState) => void;
//   priceRange: [number, number];
// }>((props) => {
//   return (
//     <div>
//       {/* Your filters implementation */}
//       <div class="space-y-4">
//         <div>
//           <h4 class="font-medium mb-2">Categories</h4>
//           {props.categories.map((category) => (
//             <label key={category} class="flex items-center space-x-2 py-1">
//               <input
//                 type="checkbox"
//                 checked={props.filters.categories.includes(category)}
//                 onChange$={(e) => {
//                   const checked = (e.target as HTMLInputElement).checked;
//                   const newCategories = checked
//                     ? [...props.filters.categories, category]
//                     : props.filters.categories.filter((c) => c !== category);
//                   props.onFiltersChange({
//                     ...props.filters,
//                     categories: newCategories,
//                   });
//                 }}
//               />
//               <span class="text-sm">{category}</span>
//             </label>
//           ))}
//         </div>

//         <div>
//           <h4 class="font-medium mb-2">Sort By</h4>
//           <select
//             value={props.filters.sortBy}
//             onChange$={(e) => {
//               props.onFiltersChange({
//                 ...props.filters,
//                 sortBy: (e.target as HTMLSelectElement).value as any,
//               });
//             }}
//             class="w-full select"
//           >
//             <option value="name">Name</option>
//             <option value="price-low">Price: Low to High</option>
//             <option value="price-high">Price: High to Low</option>
//             <option value="rating">Rating</option>
//           </select>
//         </div>

//         <div>
//           <label class="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               checked={props.filters.inStock}
//               onChange$={(e) => {
//                 props.onFiltersChange({
//                   ...props.filters,
//                   inStock: (e.target as HTMLInputElement).checked,
//                 });
//               }}
//             />
//             <span class="text-sm">In Stock Only</span>
//           </label>
//         </div>
//       </div>
//     </div>
//   );
// });
