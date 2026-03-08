import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core dependencies
          react: ["react", "react-dom"],
          // Firebase
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          // UI libraries
          ui: ["recharts", "framer-motion"],
          // Router and state management
          routing: ["react-router-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
