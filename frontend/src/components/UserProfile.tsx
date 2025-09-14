import { User, Settings, Heart, Package, LogOut, CreditCard } from "~/icons";
import { Button } from "~/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   li,
//   DropdownMenuLabel,
//   div class="divider",
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { $, CSSProperties } from "@builder.io/qwik";
import { cn } from "~/lib/utils";
// import { useToast } from "@/hooks/use-toast";

interface UserProfileProps {
  isAuthenticated?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const UserProfile = ({
  isAuthenticated = false,
  user = { name: "John Doe", email: "john@example.com" },
}: UserProfileProps) => {
  const handleSignOut = $(() => {
    //     toast({
    //       title: "Signed out",
    //       description: "You have been successfully signed out",
    //     });
    //     setIsOpen(false);
  });

  const handleMenuAction = $((action: string) => {
    //     toast({
    //       title: action,
    //       description: `${action} feature coming soon!`,
    //     });
    //     setIsOpen(false);
  });

  if (!isAuthenticated) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          popovertarget="popover-1"
          style={{ anchorName: "--anchor-1" } as CSSProperties}
        >
          <User class="h-5 w-5" />
        </Button>
        <ul
          class="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
          popover="auto"
          id="popover-1"
          style="position-anchor:--anchor-1"
        >
          <label class="label">Account</label>

          <div class="divider" />
          <li onClick$={() => handleMenuAction("Sign In")}>
            <div class="flex items-center gap-3">
              <User />
              Sign In
            </div>
          </li>

          <li onClick$={() => handleMenuAction("Create Account")}>
            <div class="flex items-center gap-3">
              <User />
              Create Account
            </div>
          </li>
        </ul>
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        class="relative h-8 w-8 rounded-full"
        popovertarget="popover-2"
        style={{ anchorName: "--anchor-1" } as CSSProperties}
      >
        <Avatar class="h-8 w-8">
          <AvatarImage src={user.avatar || ""} alt={user.name} />
          <AvatarFallback class="bg-surface">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      </Button>
      <ul
        class="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
        popover="auto"
        id="popover-2"
        style="position-anchor:--anchor-1"
      >
        <label class="font-normal label">
          <div class="flex flex-col space-y-1">
            <div class="flex items-center space-x-2">
              <p class="text-sm font-medium leading-none">{user.name}</p>
              <Badge variant="secondary" class="text-xs text-black  ">
                Pro
              </Badge>
            </div>
            <p class="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </label>
        <div class=" divider m-0" />

        <li
          onClick$={() => handleMenuAction("My Orders")}
          class=" dropdown-start"
        >
          <div class="flex items-center gap-3">
            <Package />
            <span>My Orders</span>
          </div>
        </li>

        <li onClick$={() => handleMenuAction("Wishlist")}>
          <div class="flex items-center gap-3">
            <Heart />
            Wishlist
          </div>
        </li>

        <li onClick$={() => handleMenuAction("Payment Methods")}>
          <div class="flex items-center gap-3">
            <CreditCard />
            Payment Methods
          </div>
        </li>

        <div class="divider m-0" />

        <li onClick$={() => handleMenuAction("Account Settings")}>
          <div class="flex items-center gap-3">
            <Settings />
            Settings
          </div>
        </li>

        <div class="divider m-0" />

        <li
          onClick$={handleSignOut}
          class="text-destructive focus:text-destructive"
        >
          <div class="flex items-center gap-3">
            <LogOut />
            Sign out
          </div>
        </li>
      </ul>
    </>
  );
};
