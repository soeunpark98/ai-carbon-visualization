import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
    },
  },
});
