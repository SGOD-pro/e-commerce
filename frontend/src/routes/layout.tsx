import {
  component$,
  Slot,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { Toaster } from "qwik-sonner";
import Navigation from "~/components/Navigation";
import { HomeContent } from "~/context/store";
import { Category, ProductNew } from "../..";
import { Auth } from "~/context/auth";

export const onRequest: RequestHandler = async (event) => {
  const { url, cookie, redirect } = event;
  const pathname = url.pathname;

  if (pathname.startsWith("/cart") || pathname.startsWith("/account")) {
    const token = cookie.get("auth-token")?.value;
    if (!token) {
      throw redirect(302, "/login");
    }
  }

  return event.next();
};

export default component$(() => {
  const homeStore = useStore<{
    topRatedProducts: ProductNew[] | null;
    recommendedProducts: ProductNew[] | null;
    categories: Category[] | null;
    featuredProducts: ProductNew[] | null;
    newArrivals: ProductNew[] | null;
    recentProducts: ProductNew[] | null;
    cartItems: ProductNew[] | null;
  }>({
    topRatedProducts: null,
    recommendedProducts: null,
    categories: null,
    featuredProducts: null,
    newArrivals: null,
    recentProducts: null,
    cartItems: null,
  });
  const authStore = useStore<{ isAuth: boolean; email: string }>({
    isAuth: false,
    email: "",
  });
  useContextProvider(HomeContent, homeStore);
  useContextProvider(Auth, authStore);
  return (
    <div class="h-dvh">
      <Toaster />
      <Navigation cartItemCount={homeStore.cartItems?.length || 0} />
      <Slot />
    </div>
  );
});

export const head: DocumentHead = {
  title: "MONO",
  meta: [
    {
      name: "This is a Qwik site",
      content: "Demonstration of a Recommendation system. RAG style.",
    },
  ],
};
