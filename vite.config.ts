import { cloudflare } from "@cloudflare/vite-plugin";
import path from "path";
import { defineConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";

export default defineConfig({
  plugins: [cloudflare(), ssrPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
