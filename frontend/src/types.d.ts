import { QwikCityPlatform } from "@builder.io/qwik-city";

declare module "@builder.io/qwik-city" {
  interface RequestEvent<PLATFORM = QwikCityPlatform> {
    locals: {
      user?: {
        isAuth: boolean;
        email: string;
        name: string;
      };
    };
  }
  interface DocumentHeadProps {
    locals: {
      user?: {
        isAuth: boolean;
        email: string;
        name: string;
      };
    };
  }
}
