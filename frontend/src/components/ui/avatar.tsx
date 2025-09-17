import {
  component$,
  createContextId,
  Slot,
  useContext,
  useContextProvider,
  useStore,
  useVisibleTask$,
  $,
  type QwikIntrinsicElements,
} from "@builder.io/qwik";
import { cn } from "~/lib/utils";

/**
 * Context state shared between AvatarImage and AvatarFallback
 */
type AvatarState = {
  isLoaded: boolean;
  hasError: boolean;
  srcMissing: boolean;
};

const AvatarContext = createContextId<AvatarState>("avatar-context");

/* ---------------------
   Avatar root wrapper
   --------------------- */
export const Avatar = component$<{ class?: string }>(({ class: className }) => {
  // shared reactive state for this avatar instance
  const state = useStore<AvatarState>({
    isLoaded: false,
    hasError: false,
    srcMissing: false,
  });

  // provide context to children
  useContextProvider(AvatarContext, state);

  return (
    <div class={cn("avatar", className)}>
      <div class="w-10 h-10 rounded-full overflow-hidden">
        {!state.isLoaded && !state.hasError && !state.srcMissing && (
          <div class="skeleton"></div>
        )}
        <Slot />
      </div>
    </div>
  );
});

/* ---------------------
   Avatar image
   --------------------- */
export type AvatarImageProps = {
  src: string;
  alt?: string;
  class?: string;
} & QwikIntrinsicElements["img"];

export const AvatarImage = component$<AvatarImageProps>(
  ({ src, alt = "avatar", class: className, ...props }) => {
    // may be undefined if used outside <Avatar />
    const state = useContext(AvatarContext);

    // client-side check: if no src given, mark srcMissing
    useVisibleTask$(() => {
      if (state && (!src || src.trim() === "")) {
        state.srcMissing = true;
        state.hasError = true;
        state.isLoaded = false;
      }
    });

    // called when native image load succeeds
    const onLoad$ = $(() => {
      if (state) {
        state.isLoaded = true;
        state.hasError = false;
      }
    });

    // called when native image load fails
    const onError$ = $(() => {
      if (state) {
        state.hasError = true;
        state.isLoaded = false;
      }
    });

    // hide image while loading or on error / when src missing.
    const hiddenWhen =
      state == null
        ? false // no context -> don't hide (behave like normal img)
        : !state.isLoaded || state.hasError || state.srcMissing;

    return (
      <img
        src={src}
        alt={alt}
        class={cn(
          "w-full h-full object-cover",
          className,
          hiddenWhen && "hidden"
        )}
        onLoad$={onLoad$}
        onError$={onError$}
        {...props}
      />
    );
  }
);

/* ---------------------
   Avatar fallback
   --------------------- */
export const AvatarFallback = component$<{ class?: string }>(
  ({ class: className }) => {
    const state = useContext(AvatarContext);

    // Decide when to show fallback:
    // - When there is no AvatarContext -> always show fallback (safe).
    // - With context -> show when image not loaded OR image has errored OR src missing.
    const shouldShow =
      state == null
        ? true
        : !state.isLoaded || state.hasError || state.srcMissing;

    return (
      <div
        class={cn(
          "flex items-center justify-center w-full h-full text-sm font-medium text-white bg-card",
          className,
          !shouldShow && "hidden"
        )}
        aria-hidden={!shouldShow}
      >
        <Slot />
      </div>
    );
  }
);
