import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",   // ensures build goes into dist/
    emptyOutDir: true // cleans dist/ before each build
  }
});