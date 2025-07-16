// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), preact()],
  output: "static",
  build: {
    format: "directory",
  },
  // Configuración específica para mejorar comportamiento en producción
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar vendor chunks para mejor caching
            vendor: ["@supabase/supabase-js"],
            auth: ["@nanostores/preact", "@supabase/auth-ui-react"],
          },
        },
      },
    },
  },
});
