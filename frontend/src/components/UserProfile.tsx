import { User, Settings, Heart, Package, LogOut, CreditCard } from "~/icons";
import { Button } from "~/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { $, component$, CSSProperties, useContext, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { toast } from "qwik-sonner";
import { Auth } from "~/context/auth";

interface UserProfileProps {
  isAuthenticated?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const UserProfile = component$(
  ({
    isAuthenticated = false,
    user = { name: "John Doe", email: "john@example.com" },
  }: UserProfileProps) => {
    const loading = useSignal(false);
    const auth = useContext(Auth);
    const handleSignOut = $(async () => {
      try {
        loading.value = true;
        const res=await fetch("http://localhost:8000/auth/signout", {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        toast.success("Signed out", {
          description: "You have been successfully signed out",
        });
        auth.email="";
        auth.name="";
        auth.isAuth=false
      } catch (error: Error | any) {
        toast.error("Error", {
          description: error.message || "Server issue.",
        });
      }finally {
        loading.value = false;
      }
    });

    if (!isAuthenticated) {
      return (
        <>
          <Button
            variant="outline"
            size="icon"
            popovertarget="popover-1"
            style={{ anchorName: "--anchor-1" } as CSSProperties}
            class={"rounded-full"}
          >
            <User class="" />
          </Button>
          <ul
            class="dropdown dropdown-end menu w-52 rounded-xl bg-base-300 shadow-sm"
            popover="auto"
            id="popover-1"
            style="position-anchor:--anchor-1"
          >
            <label class="label px-4">Account</label>

            <div class="divider my-0" />
            <li>
              <Link href="/auth/signin">
                <div class="flex items-center gap-3">
                  <LogOut />
                  Sign In
                </div>
              </Link>
            </li>

            <li>
              <Link href="/auth/signup">
                <div class="flex items-center gap-3">
                  <User />
                  Create Account
                </div>
              </Link>
            </li>
          </ul>
        </>
      );
    }

    return (
      <>
        <Button
          variant="outline"
          size="sm"
          class="relative h-8 w-8 rounded-full"
          popovertarget="popover-2"
          style={{ anchorName: "--anchor-1" } as CSSProperties}
        >
          <Avatar class="h-8 w-8">
            <AvatarImage src={user.avatar || ""} alt={user.name} />
            <AvatarFallback class="bg-surface">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </Button>
        <ul
          class="dropdown dropdown-end menu w-52  bg-base-300  rounded-xl shadow-sm"
          popover="auto"
          id="popover-2"
          style="position-anchor:--anchor-1"
        >
          <label class="font-normal label px-4">
            <div class="flex flex-col space-y-1">
              <div class="flex items-center space-x-2">
                <p class="text-sm font-medium leading-none">{user.name}</p>
                <Badge variant="secondary" class="text-xs">
                  Pro
                </Badge>
              </div>
              <p class="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </label>
          <div class=" divider m-0" />

          <li class=" dropdown-start">
            <div class="flex items-center gap-3">
              <Package />
              <span>My Orders</span>
            </div>
          </li>

          <li>
            <div class="flex items-center gap-3">
              <Heart />
              Wishlist
            </div>
          </li>

          <li>
            <div class="flex items-center gap-3">
              <CreditCard />
              Payment Methods
            </div>
          </li>

          <div class="divider m-0" />

          <li>
            <div class="flex items-center gap-3">
              <Settings />
              Settings
            </div>
          </li>

          <div class="divider m-0" />

          <li
            onClick$={handleSignOut}
            class="text-destructive focus:text-destructive hover:bg-destructive/20 overflow-hidden rounded-lg"
            aria-disabled={true}
          >
            <div class="flex items-center gap-3">
              <LogOut />
              Sign out
            </div>
          </li>
        </ul>
      </>
    );
  }
);
