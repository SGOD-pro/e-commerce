import { $, component$, useSignal } from "@builder.io/qwik";
import { Link, useNavigate } from "@builder.io/qwik-city";
import { ShoppingCart, Search, Menu, X, Cart } from "~/icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
// import ThemeToggle from '@/components/ThemeToggle';
import { UserProfile } from "~/components/UserProfile";
import { cn } from "~/lib/utils";

interface NavigationProps {
  cartItemCount?: number;
}

export default component$((props: NavigationProps) => {
  const isMenuOpen = useSignal<boolean>(false);
  const searchQuery = useSignal<string>("");
  const navigate = useNavigate();

  const cartItemCount = props.cartItemCount ?? 2;

  const handleSubmit = $((ev: Event) => {
    ev.preventDefault();
    const q = searchQuery.value.trim();
    if (!q) return;
    console.log(q)
    navigate(`/search?q=${encodeURIComponent(q)}`);
  });

  return (
    <nav class="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" class="font-bold text-xl tracking-tight">
            MONO
          </Link>

          {/* Desktop Search Bar */}
          <div class="hidden md:flex flex-1 max-w-md mx-8">
            <form preventdefault:submit onSubmit$={handleSubmit} class="relative w-full">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 "
                size={20}
              />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery.value}
                onInput$={(e: Event) => {
                  searchQuery.value = (e.target as HTMLInputElement).value;
                }}
                class="pl-10 bg-base-300 border-border/50 focus:border-foreground/20"
              />
            </form>
          </div>

          {/* Desktop Navigation */}
          <div class="hidden md:flex items-center space-x-4">
            <Link
              href="/categories"
              class="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Categories
            </Link>

            {/* <ThemeToggle /> */}

            <Link href="/cart">
              <Button variant="ghost" size="sm" class="relative">
                <Cart />
                {cartItemCount > 0 && (
                  <span class="absolute -top-1 -right-1 bg-foreground text-background text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium ">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            <UserProfile isAuthenticated={true} />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            class="md:hidden"
            onClick$={() => (isMenuOpen.value = !isMenuOpen.value)}
          >
            {isMenuOpen.value ? (
              <X class="h-5 w-5" />
            ) : (
              <Menu class="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div
          class={cn(
            "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
            isMenuOpen.value ? "max-h-96 pb-4" : "max-h-0"
          )}
        >
          {/* Mobile Search */}
          <div class="pt-4 pb-2">
            <form onSubmit$={handleSubmit} class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery.value}
                onInput$={(e: Event) => {
                  // ONLY update signal; no API calls here
                  searchQuery.value = (e.target as HTMLInputElement).value;
                }}
                class="pl-10 bg-surface border-border/50 focus:border-foreground/20"
              />
            </form>
          </div>

          {/* Mobile Navigation Links */}
          <div class="flex flex-col space-y-3 pt-2">
            <Link
              href="/categories"
              class="flex items-center text-foreground/80 hover:text-foreground transition-colors font-medium py-2"
              onClick$={() => (isMenuOpen.value = false)}
            >
              Categories
            </Link>

            <div class="flex items-center space-x-4 py-2">
              {/* <ThemeToggle /> */}

              <Link href="/cart" onClick$={() => (isMenuOpen.value = false)}>
                <Button variant="ghost" size="sm" class="relative">
                  <ShoppingCart class="h-5 w-5 mr-2" />
                  Cart
                  {cartItemCount > 0 && (
                    <span class="ml-2 bg-foreground text-background text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>

              <div onClick$={() => (isMenuOpen.value = false)}>
                <UserProfile isAuthenticated={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
});
