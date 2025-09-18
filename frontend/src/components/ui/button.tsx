import { component$, Slot, type QwikIntrinsicElements } from "@builder.io/qwik";
import { cn } from "~/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: " px-4",
        sm: "h-7 px-3",
        lg: "h-10 rounded-lg px-8",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = {
  asChild?: boolean;
  class?: string;
} & VariantProps<typeof buttonVariants> &
  QwikIntrinsicElements["button"];

export const Button = component$((props: ButtonProps) => {
  const {
    variant,
    size,
    asChild = false,
    class: className,
    ...rest
  } = props;

  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    return (
      <div class={classes} {...(rest as QwikIntrinsicElements["div"])}>
        <Slot />
      </div>
    );
  }

  return (
    <button class={classes} {...rest}>
      <Slot />
    </button>
  );
});
