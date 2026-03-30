import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import chatPlugin from "./server/vite-plugin-chat";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    chatPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
