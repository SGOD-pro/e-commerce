import { component$, Slot } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import Navigation from "~/components/Navigation";

export default component$(() => {

  return (
    <div class="h-dvh">
      <Navigation cartItemCount={4} />

      <Slot />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
