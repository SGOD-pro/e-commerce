import { createContextId } from "@builder.io/qwik";

export const Auth = createContextId<{
  isAuth: boolean;
  email: string;
  name: string;
}>("auth");
