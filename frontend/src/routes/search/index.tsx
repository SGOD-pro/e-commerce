import {
  component$,
  useSignal,
  useTask$,
  $,
  useComputed$,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { Filter, X } from "~/icons";
import productsData from "~/data/products.json";
import { Badge } from "~/components/ui/badge";
import { ProductCard } from "~/components/ProductCard";
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

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  inStock: boolean;
  sortBy: "name" | "price-low" | "price-high" | "rating";
}

// Add slugs to products for SEO optimization
const productsWithSlugs = productsData.map((product) => ({
  ...product,
  slug: product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
}));

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

// ActiveFiltersBadge component
const ActiveFiltersBadge = component$<{ count: number }>((props) => {
  if (props.count === 0) return null;

  return (
    <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 ml-2 h-5 w-5 p-0 justify-center">
      {props.count}
    </span>
  );
});

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();

  const filteredProducts = useSignal<Product[]>([]);
  const isLoading = useSignal(false);
  const isMobileFiltersOpen = useSignal(false);

  const filters = useSignal<FilterState>({
    categories: location.url.searchParams.get("category")
      ? [location.url.searchParams.get("category")!]
      : [],
    priceRange: [0, 1000],
    inStock: false,
    sortBy: "name",
  });

  // Computed search query
  const searchQuery = useComputed$(
    () => location.url.searchParams.get("q") || ""
  );

  // Computed categories list
  const categories = useComputed$(() =>
    Array.from(new Set(productsWithSlugs.map((p) => p.category)))
  );

  // Filter products function
  const filterProducts = $((query: string, currentFilters: FilterState) => {
    isLoading.value = true;

    setTimeout(() => {
      let filtered = productsWithSlugs.filter((product) => {
        const matchesSearch =
          query === "" ||
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase());

        const matchesCategory =
          currentFilters.categories.length === 0 ||
          currentFilters.categories.includes(product.category);

        const matchesPrice =
          product.price >= currentFilters.priceRange[0] &&
          product.price <= currentFilters.priceRange[1];

        const matchesStock = !currentFilters.inStock || product.inStock;

        return matchesSearch && matchesCategory && matchesPrice && matchesStock;
      });

      // Apply sorting
      switch (currentFilters.sortBy) {
        case "price-low":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price-high":
          filtered.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case "name":
        default:
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }

      filteredProducts.value = filtered;
      isLoading.value = false;
    }, 0);
  });

  // Task for URL parameter changes
  useTask$(({ track }) => {
    track(() => location.url.searchParams);

    const query = location.url.searchParams.get("q") || "";
    const category = location.url.searchParams.get("category");

    const newFilters = {
      ...filters.value,
      categories: category ? [category] : [],
    };
    filters.value = newFilters;
    filterProducts(query, newFilters);
  });

  // Search change handler
  const handleSearchChange = $((query: string) => {
    const newUrl = new URL(location.url);
    if (query) {
      newUrl.searchParams.set("q", query);
    } else {
      newUrl.searchParams.delete("q");
    }
    navigate(newUrl.pathname + newUrl.search);
  });

  // Filters change handler
  const handleFiltersChange = $((newFilters: FilterState) => {
    filters.value = newFilters;
    filterProducts(searchQuery.value, newFilters);
  });

  // Clear search handler
  const clearSearch = $(() => {
    const newUrl = new URL(location.url);
    newUrl.searchParams.delete("q");
    navigate(newUrl.pathname + newUrl.search);
    filterProducts("", filters.value);
  });

  // Computed active filters count
  const activeFiltersCount = useComputed$(() => {
    let count = 0;
    if (filters.value.categories.length > 0) count++;
    if (filters.value.priceRange[0] > 0 || filters.value.priceRange[1] < 1000)
      count++;
    if (filters.value.inStock) count++;
    if (filters.value.sortBy !== "name") count++;
    return count;
  });

  // Clear all filters handler
  const clearAllFilters = $(() => {
    handleFiltersChange({
      categories: [],
      priceRange: [0, 1000],
      inStock: false,
      sortBy: "name",
    });
  });

  const toggleMobileFilters = $(() => {
    isMobileFiltersOpen.value = !isMobileFiltersOpen.value;
  });

  return (
    <div class="min-h-screen bg-background">
      <Navigation onSearchChange={handleSearchChange} />

      <main class="max-w-7xl mx-auto px-4 py-8">
        {/* Search Results Header */}
        <div class="mb-8">
          <div class="flex items-center space-x-4 mb-4">
            {/* Mobile Filters Button */}
            <button
              onClick$={toggleMobileFilters}
              class="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 relative"
            >
              <Filter class="h-4 w-4 mr-2" />
              Filters
              <ActiveFiltersBadge count={activeFiltersCount.value} />
            </button>
          </div>

          {/* Search Results Info */}
          <div class="flex items-center justify-between">
            <SearchResultsInfo
              searchQuery={searchQuery.value}
              resultsCount={filteredProducts.value.length}
            />

            {activeFiltersCount.value > 0 && (
              <button
                onClick$={clearAllFilters}
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filters Overlay */}
        {isMobileFiltersOpen.value && (
          <div class="fixed inset-0 z-50 md:hidden">
            <div
              class="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick$={toggleMobileFilters}
            ></div>
            <div class="fixed left-0 top-0 h-full w-80 bg-background border-r shadow-lg p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold">Filters</h3>
                <button
                  onClick$={toggleMobileFilters}
                  class="h-8 w-8 rounded-full hover:bg-accent flex items-center justify-center"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
              <ProductFilters
                categories={categories.value}
                filters={filters.value}
                onFiltersChange={handleFiltersChange}
                priceRange={[0, 1000]}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div class="grid lg:grid-cols-4 gap-8">
          {/* Desktop Filters */}
          <aside class="hidden md:block">
            <div class="sticky top-24">
              <h3 class="font-semibold text-foreground mb-4 flex items-center">
                Filters
                <ActiveFiltersBadge count={activeFiltersCount.value} />
              </h3>
              <ProductFilters
                categories={categories.value}
                filters={filters.value}
                onFiltersChange={handleFiltersChange}
                priceRange={[0, 1000]}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <div class="lg:col-span-3">
            {isLoading.value ? (
              <div class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
              </div>
            ) : filteredProducts.value.length > 0 ? (
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.value.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView$={() => console.log("Quick view:", product)}
                    onAddToCart$={() => console.log("Add to cart:", product)}
                  />
                ))}
              </div>
            ) : (
              <div class="text-center py-12">
                <Filter class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 class="text-lg font-medium text-foreground mb-2">
                  No products found
                </h3>
                <p class="text-muted-foreground">
                  {searchQuery.value
                    ? `No products match "${searchQuery.value}". Try adjusting your search or filters.`
                    : "No products match your current filters."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
});

// Navigation component placeholder
const Navigation = component$<{
  onSearchChange: (query: string) => void;
}>((props) => {
  return <nav>{/* Your navigation content with search */}</nav>;
});

// ProductFilters component placeholder
const ProductFilters = component$<{
  categories: string[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  priceRange: [number, number];
}>((props) => {
  return (
    <div>
      {/* Your filters implementation */}
      <div class="space-y-4">
        <div>
          <h4 class="font-medium mb-2">Categories</h4>
          {props.categories.map((category) => (
            <label key={category} class="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                checked={props.filters.categories.includes(category)}
                onChange$={(e) => {
                  const checked = (e.target as HTMLInputElement).checked;
                  const newCategories = checked
                    ? [...props.filters.categories, category]
                    : props.filters.categories.filter((c) => c !== category);
                  props.onFiltersChange({
                    ...props.filters,
                    categories: newCategories,
                  });
                }}
              />
              <span class="text-sm">{category}</span>
            </label>
          ))}
        </div>

        <div>
          <h4 class="font-medium mb-2">Sort By</h4>
          <select
            value={props.filters.sortBy}
            onChange$={(e) => {
              props.onFiltersChange({
                ...props.filters,
                sortBy: (e.target as HTMLSelectElement).value as any,
              });
            }}
            class="w-full select"
          >
            <option value="name">Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        <div>
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={props.filters.inStock}
              onChange$={(e) => {
                props.onFiltersChange({
                  ...props.filters,
                  inStock: (e.target as HTMLInputElement).checked,
                });
              }}
            />
            <span class="text-sm">In Stock Only</span>
          </label>
        </div>
      </div>
    </div>
  );
});

// ProductGrid component placeholder
const ProductGrid = component$<{
  products: Product[];
  onQuickView: () => void;
  onAddToCart: () => void;
  isLoading: boolean;
}>((props) => {
  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {props.products.map((product) => (
        <div key={product.id} class="border rounded-lg p-4">
          <img
            src={product.image}
            alt={product.name}
            class="w-full h-48 object-cover rounded mb-2"
          />
          <h3 class="font-semibold">{product.name}</h3>
          <p class="text-sm text-muted-foreground mb-2">{product.category}</p>
          <div class="flex items-center justify-between">
            <span class="font-bold">${product.price.toFixed(2)}</span>
            <Badge class="flex items-center space-x-1">
              <span class="text-xs">★</span>
              <span class="text-xs">{product.rating}</span>
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
});
