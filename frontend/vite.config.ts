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
    hmr: {
      clientPort: 3000, // Use same port for client connection
      host: 'localhost', // Ensure HMR connects to localhost
    },
  },
  clearScreen: false,
});
