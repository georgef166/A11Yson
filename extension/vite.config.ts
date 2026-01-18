import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
// @ts-ignore
import manifest from "./manifest.json";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), crx({ manifest })],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
