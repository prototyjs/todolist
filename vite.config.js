import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import faviconPwa from "vite-plugin-favicon-pwa"

export default defineConfig({
  plugins: [
    faviconPwa({
      name: "Prototy Todo App",
      shortName: "Todo App",
      source: "src/assets/favicon.svg",
      themeColor: "#21ac50",
      background: "#ffffff",
    }),
    VitePWA({
      registerType: "autoUpdate",
      manifestFilename: "manifest.webmanifest",
      manifest: {
        name: "Prototy Todo App",
        short_name: "Todo App",
        description: "A simple todo app built with Prototy framework.",
        theme_color: "#21ac50",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    port: 3000,
  },
})
