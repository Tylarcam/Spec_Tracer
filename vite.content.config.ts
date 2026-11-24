import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Separate IIFE build so the content script is a single file with no ESM imports
// (Chrome content_scripts cannot load code-split chunks).
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    emptyOutDir: false,
    outDir: "dist",
    sourcemap: false,
    minify: true,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, "src/extension/LogTraceContent.tsx"),
      name: "SpecTracerContent",
      formats: ["iife"],
      fileName: () => "assets/content.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
