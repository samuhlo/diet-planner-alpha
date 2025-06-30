// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import preact from "@astrojs/preact";
import clerk from "@clerk/astro";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    preact({ compat: true }),
    clerk({
      signInFallbackRedirectUrl: "/",
      signUpFallbackRedirectUrl: "/",
      signInUrl: "/sign-in",
      signUpUrl: "/sign-up",
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
