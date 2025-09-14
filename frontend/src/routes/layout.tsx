import { $, component$, Slot } from "@builder.io/qwik";
import { DocumentHead, useNavigate } from "@builder.io/qwik-city";
import Navigation from "~/components/Navigation";

export default component$(() => {
  const navigate = useNavigate();
  const handleSearchChange = $((query: string) => {
    navigate(`/search?q=${query}`);
    console.log("Search query:", query);
  });
  return (
    <div class="h-dvh">
      <Navigation cartItemCount={4} onSearchChange={handleSearchChange} />

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
