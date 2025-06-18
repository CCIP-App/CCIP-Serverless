import { cloudflare } from "@cloudflare/vite-plugin";
import path from "path";
import { defineConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";

const drizzleSqlPlugin = () => ({
  name: "vite-plugin-sql",
  transform(content: string, id: string) {
    if (id.endsWith(".sql")) {
      return {
        code: `export default ${JSON.stringify(content)};`,
        map: null,
      };
    }
  },
});

export default defineConfig({
  plugins: [cloudflare(), ssrPlugin(), drizzleSqlPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
