import { component$, useStore, $, Slot } from "@builder.io/qwik";
import { z } from "zod";

/**
 * Adjust this URL to your backend origin / path.
 * If backend is on same origin / proxied, you can use a relative path like "/api/signup"
 */
const SIGNUP_URL = "http://localhost:8000/signup";

/* ---------- ZOD SCHEMA ---------- */
const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupData = z.infer<typeof signupSchema>;

/* ---------- Component ---------- */
export default component$(() => {
  const store = useStore({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    submitting: false,
    success: "",
    serverError: "",
    // errors will hold field errors keyed by field name
    errors: {} as Record<string, string[] | undefined>,
  });

const submit$ = $(async (e: SubmitEvent) => {
  e.preventDefault();
  store.serverError = "";
  store.success = "";
  store.errors = {};

  const data: SignupData = {
    name: store.name,
    email: store.email,
    password: store.password,
    confirmPassword: store.confirmPassword,
  };

  // Client-side validation
  const parsed = signupSchema.safeParse(data);
  if (!parsed.success) {
    // Use Zod's flatten() to get fieldErrors as Record<string, string[]>
    const { fieldErrors } = parsed.error.flatten();
    // fieldErrors: Record<string, string[]>
    store.errors = fieldErrors;
    return;
  }

  // submit to backend
  store.submitting = true;
  try {
    const res = await fetch(SIGNUP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: data.name,
      }),
      // credentials: "include", // enable if backend sets cookies across origins
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      store.serverError = errJson?.detail || errJson?.message || "Signup failed";
    } else {
      const json = await res.json().catch(() => null);
      store.success = json?.message || "Account created successfully";
      setTimeout(() => (window.location.href = "/auth/signin"), 900);
    }
  } catch (err) {
    console.error("Signup error:", err);
    store.serverError = "Network error. Please try again.";
  } finally {
    store.submitting = false;
  }
});


  const showFieldError = (field: string) => {
    const v = store.errors[field];
    if (!v) return null;
    return v.map((m, idx) => (
      <p key={idx} class="mt-1 text-xs text-red-400" role="alert">
        {m}
      </p>
    ));
  };

  return (
    <div class="flex flex-col justify-center px-6 py-12 lg:px-8 h-dvh">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 class="text-5xl font-bold tracking-widest text-secondary/30 text-center">SGOD</h1>
        <h2 class="text-center text-lg/9 text-white">Create your account</h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit$={submit$} class="space-y-4" noValidate>
          {/* Name */}
          <div>
            <label for="name" class="block text-sm/6 font-medium text-gray-100">
              Name
            </label>
            <div class="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                required
                autocomplete="name"
                value={store.name}
                onInput$={(ev) => (store.name = (ev.target as HTMLInputElement).value)}
                class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                aria-invalid={!!store.errors.name}
                aria-describedby={store.errors.name ? "name-error" : undefined}
              />
              <div id="name-error">{showFieldError("name")}</div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label for="email" class="block text-sm/6 font-medium text-gray-100">
              Email address
            </label>
            <div class="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autocomplete="email"
                value={store.email}
                onInput$={(ev) => (store.email = (ev.target as HTMLInputElement).value)}
                class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                aria-invalid={!!store.errors.email}
                aria-describedby={store.errors.email ? "email-error" : undefined}
              />
              <div id="email-error">{showFieldError("email")}</div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label for="password" class="block text-sm/6 font-medium text-gray-100">
              Password
            </label>
            <div class="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autocomplete="new-password"
                value={store.password}
                onInput$={(ev) => (store.password = (ev.target as HTMLInputElement).value)}
                class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                aria-invalid={!!store.errors.password}
                aria-describedby={store.errors.password ? "password-error" : undefined}
              />
              <div id="password-error">{showFieldError("password")}</div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label for="confirmPassword" class="block text-sm/6 font-medium text-gray-100">
              Confirm Password
            </label>
            <div class="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autocomplete="new-password"
                value={store.confirmPassword}
                onInput$={(ev) => (store.confirmPassword = (ev.target as HTMLInputElement).value)}
                class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                aria-invalid={!!store.errors.confirmPassword}
                aria-describedby={store.errors.confirmPassword ? "confirmPassword-error" : undefined}
              />
              <div id="confirmPassword-error">{showFieldError("confirmPassword")}</div>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
              disabled={store.submitting}
            >
              {store.submitting ? "Signing up..." : "Sign up"}
            </button>
          </div>

          {/* Server / global messages */}
          {store.serverError && <p class="text-sm text-red-400 mt-2">{store.serverError}</p>}
          {store.success && <p class="text-sm text-green-400 mt-2">{store.success}</p>}
        </form>

        <p class="mt-6 text-center text-sm/6 text-gray-400">
          Already buying from us?{" "}
          <a href="/auth/signin" class="font-semibold text-indigo-400 hover:text-indigo-300">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
});
