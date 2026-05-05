import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * GitHub Pages project site lives at https://<user>.github.io/<repo>/
 * User/org root site uses repo named <user>.github.io → served at /
 */
function githubPagesBase() {
  const raw = process.env.GITHUB_REPOSITORY;
  if (!raw) return "/";
  const [owner, repo] = raw.split("/");
  if (!owner || !repo) return "/";
  if (repo === `${owner}.github.io`) return "/";
  return `/${repo}/`;
}

export default defineConfig({
  base: githubPagesBase(),
  root: ".",
  publicDir: "public",
  build: {
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
    },
  },
});
