import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
// @ts-expect-error type error without @types/node package
import process from "node:process";
// @ts-expect-error type error without @types/node package
import { rmSync } from "node:fs";
const host = process.env.TAURI_DEV_HOST;

/** VITE_HIDE_IMAGES=1: the app shows initials instead of images, so the copied public/images is dropped too. */
function dropImages(): Plugin {
  return {
    name: "drop-images",
    apply: "build",
    closeBundle() {
      rmSync("dist/images", { recursive: true, force: true });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), loadEnv(mode, process.cwd(), "VITE_").VITE_HIDE_IMAGES === "1" && dropImages()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
