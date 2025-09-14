import { component$, type QwikIntrinsicElements } from "@builder.io/qwik";
import { cn } from "~/lib/utils";

export type InputProps = QwikIntrinsicElements["input"] & {
  class?: string;
};

export const Input = component$((props: InputProps) => {
  const { class: className = "", type = "text", ...rest } = props;

  return (
    <input
      type={type}
      class={cn(
        "flex h-10 w-full rounded-md bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...rest}
    />
  );
});
