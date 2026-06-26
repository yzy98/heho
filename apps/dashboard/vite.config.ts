import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const createApiProxy = (apiUrl: string) => ({
  "/api": {
    target: apiUrl,
    changeOrigin: true,
    rewrite: (requestPath: string) => requestPath.replace(/^\/api/, ""),
  },
});

const rootDir = path.resolve(import.meta.dirname, "../..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, "");

  if (!(env.API_URL && env.APP_PORT)) {
    throw new Error("API_URL and APP_PORT are required");
  }

  const apiProxy = createApiProxy(env.API_URL);

  return {
    envDir: rootDir,
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      port: Number(env.APP_PORT),
      proxy: apiProxy,
    },
    preview: {
      port: Number(env.APP_PORT),
      proxy: apiProxy,
    },
  };
});
