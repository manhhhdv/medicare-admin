/* eslint-disable no-undef */
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),

    // VitePWA({
    //   manifest: {
    //    "name": "Medicare - Admin",
    // "short_name": "Medicare",
    // "description": "A fast and modern Vite React app.",
    // "start_url": "/admin",
    // "display": "standalone",
    // "background_color": "#ffffff",
    // "theme_color": "#317EFB",
    // "orientation": "portrait",
    // "icons": [
    //   {
    //     "src": "/admin/192x192.png",
    //     "sizes": "192x192",
    //     "type": "image/png"
    //   },
    //   {
    //     "src": "/admin/512.png",
    //     "sizes": "512x512",
    //     "type": "image/png"
    //   },
    //   {
    //     "src": "/admin/512x512.png",
    //     "sizes": "512x512",
    //     "type": "image/png",
    //     "purpose": "maskable"
    //   }
    // ]
    //   },
    //   registerType: "autoUpdate",
    //   includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
    // }),
  ],
  define: {
    "process.env": process.env, // Ensure this is included
  },
  base: "/admin/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
