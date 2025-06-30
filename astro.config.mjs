// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import preact from "@astrojs/preact";
import clerk from "@clerk/astro";
import { esES } from "@clerk/localizations";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    preact({ compat: true }),
    clerk({
      localization: esES,
      signInFallbackRedirectUrl: "/",
      signUpFallbackRedirectUrl: "/",
      signInUrl: "/sign-in",
      signUpUrl: "/sign-up",
      appearance: {
        variables: {
          colorPrimary: "#6B8A7A",
          colorBackground: "#ffffff",
          colorText: "#3d405b",
          fontFamily: "'Inter', sans-serif",
          borderRadius: "8px",
        },
      },
    }),
  ],
  adapter: node({ mode: "standalone" }),
  output: "server",
  vite: {
    define: {
      global: "globalThis",
    },
  },
});
