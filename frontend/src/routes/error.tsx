// src/routes/error.tsx
import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="flex flex-col items-center justify-center h-screen text-center">
      <h1 class="text-3xl font-bold mb-4">Oops! Something went wrong</h1>
      <p class="text-gray-400">Please try again later.</p>
      <a href="/" class="mt-6 text-blue-500 underline">
        Go Home
      </a>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Error",
};
