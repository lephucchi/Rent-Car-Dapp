import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    hmr: false, // Disable HMR to prevent fetch errors in proxied environment
  },
  clearScreen: false,
});
