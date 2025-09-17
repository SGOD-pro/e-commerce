import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { ProductNew } from "../../../..";
import { ProductCard } from "~/components/ProductCard";

const Recomended = component$(({ id }: { id: string }) => {
  const recommendedProducts = useSignal<ProductNew[]>([]);
  const loadinRecommendedProducts = useSignal(false);
  useVisibleTask$(async () => {
    if (!id) {
      return;
    }
    loadinRecommendedProducts.value = true;
    const response = await fetch(
      `http://localhost:8000/products/recommend-items/${id}?limit=7`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    console.log(result.products);
    recommendedProducts.value = result.products as ProductNew[];
    loadinRecommendedProducts.value = false;
  });
  return (
    <>
      {loadinRecommendedProducts.value ? (
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      ) : recommendedProducts.value.length > 0 ? (
        <section>
          <h2 class="text-2xl font-bold text-foreground mb-6">
            You might also like
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.value.map((recommendedProduct) => (
              <ProductCard
                key={recommendedProduct.id}
                product={recommendedProduct}
                onQuickView$={() =>
                  console.log("Quick view:", recommendedProduct)
                }
                onAddToCart$={() =>
                  console.log("Add to cart:", recommendedProduct)
                }
              />
            ))}
          </div>
        </section>
      ) : (
        <section class="flex items-center justify-center text-secondary">
          <h4>No recommended products</h4>
        </section>
      )}
    </>
  );
});

export default Recomended;
