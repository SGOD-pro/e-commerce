import { component$, Slot, type QwikIntrinsicElements } from '@builder.io/qwik';
import { cn } from '~/lib/utils';

// Avatar root wrapper
export const Avatar = component$<{ class?: string }>(({ class: className }) => {
  return (
    <div class={cn("avatar", className)}>
      <div class="w-10 h-10 rounded-full overflow-hidden">
        <Slot />
      </div>
    </div>
  );
});

// Avatar image
export type AvatarImageProps = {
  src: string;
  alt?: string;
  class?: string;
} & QwikIntrinsicElements['img'];

export const AvatarImage = component$<AvatarImageProps>(
  ({ src, alt = "avatar", class: className, ...props }) => {
    return (
      <img
        src={src}
        alt={alt}
        class={cn("w-full h-full object-cover", className)}
        {...props}
      />
    );
  }
);

// Avatar fallback
export const AvatarFallback = component$<{ class?: string }>(
  ({ class: className }) => {
    return (
      <div
        class={cn(
          "flex items-center justify-center w-full h-full bg-base-300 text-base-content",
          className
        )}
      >
        <Slot />
      </div>
    );
  }
);
