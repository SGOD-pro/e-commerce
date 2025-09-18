import {
  component$,
  Slot,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  DocumentHead,
  RequestHandler,
  routeLoader$,
} from "@builder.io/qwik-city";
import { Toaster } from "qwik-sonner";
import Navigation from "~/components/Navigation";
import { HomeContent } from "~/context/store";
import { Category, ProductNew } from "../..";
import { Auth } from "~/context/auth";

export const onRequest: RequestHandler = async (event) => {
  const { url, cookie, redirect } = event;
  const pathname = url.pathname;

  const token = cookie.get("auth_token")?.value; // fix: cookie key should match backend

  if (pathname.startsWith("/cart") || pathname.startsWith("/account")) {
    if (!token) {
      throw redirect(302, "/auth/signin");
    }
  }
  // Helper to safely set user only if event.locals exists
  const setLocalsUser = (userObj: {
    isAuth: boolean;
    email: string;
    name: string;
  }) => {
    if (event && "locals" in event && event.locals) {
      event.locals.user = userObj;
    } else {
      // runtime doesn't expose mutable locals; avoid throwing
      console.warn(
        "Warning: event.locals is not available; skipping set of locals.user"
      );
    }
  };

  if (token) {
    try {
      const meRes = await fetch("http://localhost:8000/auth/me", {
        credentials: "include",
      });

      if (meRes.ok) {
        const me = await meRes.json();
        setLocalsUser({
          isAuth: true,
          email: me.email ?? "",
          name: me.name ?? "",
        });
      } else {
        setLocalsUser({ isAuth: false, email: "", name: "" });
      }
    } catch (err) {
      console.error("Failed to fetch /me:", err);
      setLocalsUser({ isAuth: false, email: "", name: "" });
    }
  } else {
    setLocalsUser({ isAuth: false, email: "", name: "" });
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

  const authStore = useStore<{ isAuth: boolean; email: string; name: string }>({
    isAuth: false,
    email: "",
    name: "",
  });

  // 👇 Hydrate client-side from SSR user
  useVisibleTask$(async() => {
    const user = (window as any).__qwikUser; // we’ll inject this below
    if (user) {
      authStore.isAuth = user.isAuth;
      authStore.email = user.email;
      authStore.name = user.name;
    }else{
    try {
      const meRes = await fetch("http://localhost:8000/auth/me", {
        credentials: "include",
      });

      if (meRes.ok) {
        const me = await meRes.json();
        authStore.isAuth = true;
        authStore.email = me?.email 
        authStore.name = me?.name
      } 
    } catch (err) {
      console.error("Failed to fetch /me:", err);
    }
    }
  });

  useContextProvider(HomeContent, homeStore);
  useContextProvider(Auth, authStore);

  return (
    <div class="h-dvh">
      <Toaster theme="dark" closeButton/>
      <Navigation cartItemCount={homeStore.cartItems?.length || 0} />
      <Slot />
    </div>
  );
});

// 👇 Inject user state into SSR <head> so client can read
export const head: DocumentHead = ({ locals }) => {
  const user = locals?.user ?? { isAuth: false, email: "", name: "" };

  return {
    title: "MONO",
    meta: [
      {
        name: "This is a Qwik site",
        content: "Demonstration of a Recommendation system. RAG style.",
      },
    ],
    scripts: user.isAuth
      ? [
          {
            props: {},
            children: `window.__qwikUser = ${JSON.stringify(user)};`,
          },
        ]
      : [],
  };
};
