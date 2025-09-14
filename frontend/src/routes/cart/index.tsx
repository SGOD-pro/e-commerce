// import { useState } from "react";
// import { Link } from "react-router-dom";
import { Trash, Plus, Minus, ShoppingBag, ArrowRight } from "~/icons";
import { Button } from "~/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { $, component$, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
// import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

const Cart = component$(() => {
  // const { toast } = useToast();
  const cartItems = useSignal<CartItem[]>([
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      price: 99.99,
      image: "/placeholder.svg",
      category: "Electronics",
      quantity: 1,
    },
    {
      id: 2,
      name: "Premium Cotton T-Shirt",
      price: 29.99,
      image: "/placeholder.svg",
      category: "Clothing",
      quantity: 2,
    },
  ]);

  const updateQuantity = $((id: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    // setCartItems((items) =>
    //   items.map((item) =>
    //     item.id === id ? { ...item, quantity: newQuantity } : item
    //   )
    // );
    cartItems.value = cartItems.value.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
  });

  const removeItem = $((id: number) => {
    cartItems.value=cartItems.value.filter((item) => item.id !== id);
    // toast({
    //   title: "Item removed",
    //   description: "Product removed from your cart",
    // });
  });

  const subtotal = cartItems.value.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleCheckout = $(() => {
    // toast({
    //   title: "Proceeding to checkout",
    //   description: "Redirecting to payment...",
    // });
  });

  if (cartItems.value.length === 0) {
    return (
      <div class="min-h-screen bg-background">
        <main class="max-w-4xl mx-auto px-4 py-8">
          <div class="text-center py-12">
            <ShoppingBag class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 class="text-2xl font-bold text-foreground mb-2">
              Your cart is empty
            </h2>
            <p class="text-muted-foreground mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-background">
      {/* <Navigation
        cartItemCount={cartItems.reduce(
          (total, item) => total + item.quantity,
          0
        )}
      /> */}

      <main class="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div class="mb-8">
          <Link
            href="/"
            class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground group mb-4"
          >
            <ArrowRight class="rotate-180 translate-x-4 scale-x-90 group-hover:scale-x-100 transition-all ease-in-out origin-left" size={20}/>
            Continue Shopping
          </Link>
          <h1 class="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p class="text-muted-foreground mt-2">
            {cartItems.value.length} {cartItems.value.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div class="lg:col-span-2 space-y-4 card bg-card">
            {cartItems.value.map((item) => (
              <div key={item.id} class="overflow-hidden">
                <div class="p-6 card-body">
                  <div class="flex items-center space-x-4">
                    {/* Product Image */}
                    <div class="w-20 h-20 bg-surface rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        class="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between">
                        <div>
                          <Badge variant="secondary" class="mb-1">
                            {item.category}
                          </Badge>
                          <h3 class="font-medium text-foreground">
                            {item.name}
                          </h3>
                          <p class="text-lg font-semibold text-foreground mt-1">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick$={() => removeItem(item.id)}
                          class="text-muted-foreground hover:text-destructive"
                        >
                          <Trash />
                        </Button>
                      </div>

                      {/* Quantity Controls */}
                      <div class="flex items-center space-x-2 mt-4">
                        <span class="text-sm text-muted-foreground">
                          Quantity:
                        </span>
                        <div class="flex items-center border border-border rounded-md">
                          <button
                            onClick$={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            class="px-3 py-1 hover:bg-surface transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus class="h-3 w-3" />
                          </button>
                          <span class="px-3 py-1 border-x border-border min-w-[2.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick$={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            class="px-3 py-1 hover:bg-surface transition-colors"
                          >
                            <Plus class="h-3 w-3" />
                          </button>
                        </div>
                        <span class="text-sm text-muted-foreground ml-auto">
                          Subtotal: ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div class="lg:col-span-1 max-h-96">
            <div class="sticky top-24 card bg-card">
              <header class="p-4 pb-0">
                <h3 class="card-title">Order Summary</h3>
              </header>
              <div class="space-y-4 card-body">
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Subtotal</span>
                  <span class="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Shipping</span>
                  <span class="font-medium">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                {shipping === 0 && (
                  <p class="text-xs text-green-600">
                    🎉 Free shipping on orders over $50!
                  </p>
                )}

                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Tax</span>
                  <span class="font-medium">${tax.toFixed(2)}</span>
                </div>

                <div class=" divider m-0" />

                <div class="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button class="w-full" size="lg" onClick$={handleCheckout}>
                  Proceed to Checkout
                </Button>

                <p class="text-xs text-muted-foreground text-center">
                  Secure checkout with SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
});

export default Cart;
