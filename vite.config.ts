import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  server: {
    host: true,
  },
  // 路径解析配置
  resolve: {
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json", ".scss", ".css"],
    alias: {
      "@": resolve(__dirname, "./src"),
      src: resolve(__dirname, "./src"),
      components: resolve(__dirname, "./src/components"),
    },
  },
  build: {
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
  },
});
