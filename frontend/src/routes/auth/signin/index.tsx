import { component$, useStore, $, useContext } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { toast } from "qwik-sonner";
import { z } from "zod";
import { Auth } from "~/context/auth"; // update path if needed

const SIGNIN_URL = "http://localhost:8000/auth/signin"; // change to your API URL
const ME_URL = "http://localhost:8000/auth/me"; // endpoint that returns current user based on cookie

/* Zod schema */
const signinSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password is required"),
});
type SigninData = z.infer<typeof signinSchema>;

export default component$(() => {
  const auth = useContext(Auth);
  const navigate=useNavigate()
  const form = useStore({
    email: "",
    password: "",
    submitting: false,
    serverError: "",
    errors: {} as Record<string, string[] | undefined>,
  });

  const showFieldError = (field: string) => {
    const v = form.errors[field];
    if (!v) return null;
    return v.map((m, i) => (
      <p key={i} class="mt-1 text-xs text-red-400" role="alert">
        {m}
      </p>
    ));
  };

  const submit$ = $(async (e: SubmitEvent) => {
    e.preventDefault();
    form.serverError = "";
    form.errors = {};

    const payload: SigninData = {
      email: form.email,
      password: form.password,
    };

    const parsed = signinSchema.safeParse(payload);
    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten();
      form.errors = fieldErrors;
      return;
    }

    form.submitting = true;
    console.log(payload);
    try {
      const res = await fetch(SIGNIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        form.serverError =
          errBody?.detail || errBody?.message || "Sign in failed";
        return;
      }

      const meRes = await fetch(ME_URL, { credentials: "include" });
      if (meRes.ok) {
        const meJson = await meRes.json().catch(() => null);
        auth.isAuth = true;
        auth.email = meJson?.email ??form.email;
        auth.name = meJson?.name ?? form.email;
        navigate('/');
      } else {
        console.warn("Failed to fetch /me after signin");
      }
    } catch (err:Error |any) {
      console.error("Signin error:", err);
      form.serverError = "Network error. Please try again.";
      toast.error(err.message||"Network error. Please try again.");
    } finally {
      form.submitting = false;
    }
  });

  return (
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 class="text-5xl font-bold tracking-widest text-secondary/30 text-center">
          SGOD
        </h1>
        <h2 class="text-center text-lg/9 text-white">
          Sign in to your account
        </h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form preventdefault:submit onSubmit$={submit$} class="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label
              for="email"
              class="block text-sm/6 font-medium text-gray-100"
            >
              Email address
            </label>
            <div class="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autocomplete="email"
                value={form.email}
                onInput$={(ev) =>
                  (form.email = (ev.target as HTMLInputElement).value)
                }
                class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                aria-invalid={!!form.errors.email}
                aria-describedby={form.errors.email ? "email-error" : undefined}
              />
              <div id="email-error">{showFieldError("email")}</div>
            </div>
          </div>

          {/* Password */}
          <div>
            <div class="flex items-center justify-between">
              <label
                for="password"
                class="block text-sm/6 font-medium text-gray-100"
              >
                Password
              </label>
              <div class="text-sm">
                <a
                  href="#"
                  class="font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </a>
              </div>
            </div>
            <div class="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autocomplete="current-password"
                value={form.password}
                onInput$={(ev) =>
                  (form.password = (ev.target as HTMLInputElement).value)
                }
                class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                aria-invalid={!!form.errors.password}
                aria-describedby={
                  form.errors.password ? "password-error" : undefined
                }
              />
              <div id="password-error">{showFieldError("password")}</div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
              disabled={form.submitting}
            >
              {form.submitting ? "Signing in..." : "Sign in"}
            </button>
          </div>

          {/* Server / global messages */}
          {form.serverError && (
            <p class="text-sm text-red-400 mt-2">{form.serverError}</p>
          )}
        </form>

        <p class="mt-10 text-center text-sm/6 text-gray-400">
          Did not buy anything?{" "}
          <a
            href="/auth/signup"
            class="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Create new account
          </a>
        </p>
      </div>
    </div>
  );
});
